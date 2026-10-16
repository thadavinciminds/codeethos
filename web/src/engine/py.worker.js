// Web Worker that runs real Python 3 (Pyodide / WebAssembly).
// Running in a worker means an infinite loop can never freeze the page:
// the main thread simply terminates this worker after a timeout.

const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

// Python harness: runs student code with a fake stdin (input()), captures
// output, and optionally runs a hidden "check" script for auto-grading.
const HARNESS = String.raw`
import sys, io, traceback, builtins, json

def __pp_run(code, stdin, check):
    out = io.StringIO()
    lines = io.StringIO(stdin)
    real_input = builtins.input

    def fake_input(prompt=""):
        out.write(str(prompt))
        line = lines.readline()
        if line == "":
            raise EOFError("input() was called, but the Input box has no more lines.")
        line = line.rstrip("\r\n")
        out.write(line + "\n")
        return line

    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = out
    builtins.input = fake_input
    ns = {"__name__": "__main__"}
    result = {"ok": True, "errorType": "", "errorMsg": "", "errorLine": 0,
              "checkOk": True, "checkMsg": ""}
    try:
        exec(compile(code, "main.py", "exec"), ns)
    except SystemExit:
        pass
    except BaseException as e:
        result["ok"] = False
        result["errorType"] = type(e).__name__
        result["errorMsg"] = str(e)
        line = getattr(e, "lineno", None) if isinstance(e, SyntaxError) else None
        if not isinstance(e, SyntaxError):
            frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == "main.py"]
            line = frames[-1].lineno if frames else None
        result["errorLine"] = line or 0
        tb = traceback.format_exception(type(e), e, e.__traceback__)
        out.write("".join(t for t in tb if "<exec>" not in t))
    finally:
        sys.stdout, sys.stderr = old_out, old_err
        builtins.input = real_input

    result["stdout"] = out.getvalue()
    if check:
        cns = dict(ns)
        cns.update(output=result["stdout"], error_type=result["errorType"], source=code)
        try:
            exec(check, cns)
        except AssertionError as e:
            result["checkOk"] = False
            result["checkMsg"] = str(e) or "Check failed"
        except BaseException as e:
            result["checkOk"] = False
            result["checkMsg"] = f"{type(e).__name__}: {e}"
    return result

def __pp_trace(code, stdin, max_steps=250):
    steps = []
    out = io.StringIO()
    lines = io.StringIO(stdin)
    real_input = builtins.input

    def fake_input(prompt=""):
        out.write(str(prompt))
        line = lines.readline()
        if line == "":
            raise EOFError("input() called, but no more lines in stdin.")
        line = line.rstrip("\r\n")
        out.write(line + "\n")
        return line

    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = out
    builtins.input = fake_input

    def trace_callback(frame, event, arg):
        if event == 'line':
            if frame.f_code.co_filename == "main.py":
                if len(steps) >= max_steps:
                    return None
                locs = {}
                for k, v in frame.f_locals.items():
                    if k.startswith('__') or k in ('_pp_run', '_pp_trace'):
                        continue
                    try:
                        r = repr(v)
                        if len(r) > 120:
                            r = r[:117] + '...'
                        locs[k] = {"type": type(v).__name__, "val": r}
                    except Exception:
                        locs[k] = {"type": type(v).__name__, "val": "<unrepresentable>"}
                steps.append({
                    "line": frame.f_lineno,
                    "event": event,
                    "locals": locs,
                    "stdout": out.getvalue()
                })
        return trace_callback

    ns = {"__name__": "__main__"}
    res = {"ok": True, "steps": [], "stdout": "", "error": "", "errorLine": 0}
    try:
        sys.settrace(trace_callback)
        exec(compile(code, "main.py", "exec"), ns)
    except SystemExit:
        pass
    except BaseException as e:
        res["ok"] = False
        res["error"] = f"{type(e).__name__}: {e}"
        tb = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == "main.py"]
        if tb:
            res["errorLine"] = tb[-1].lineno
    finally:
        sys.settrace(None)
        sys.stdout, sys.stderr = old_out, old_err
        builtins.input = real_input

    res["steps"] = steps
    res["stdout"] = out.getvalue()
    return json.dumps(res)
`;

let pyodide = null;

const ready = (async () => {
  const { loadPyodide } = await import(/* @vite-ignore */ PYODIDE_BASE + 'pyodide.mjs');
  pyodide = await loadPyodide({ indexURL: PYODIDE_BASE });
  pyodide.runPython(HARNESS);
  self.postMessage({ type: 'ready', version: pyodide.version });
})().catch((err) => {
  self.postMessage({ type: 'load-error', message: String(err) });
});

self.onmessage = async (e) => {
  const { id, mode, code, stdin, check } = e.data;
  await ready;

  if (mode === 'trace') {
    const fn = pyodide.globals.get('__pp_trace');
    try {
      const jsonStr = fn(code, stdin || '');
      const data = JSON.parse(jsonStr);
      self.postMessage({ type: 'result', id, ...data });
    } catch (err) {
      self.postMessage({ type: 'result', id, ok: false, steps: [], stdout: '', error: String(err), errorLine: 0 });
    } finally {
      fn.destroy();
    }
    return;
  }

  const fn = pyodide.globals.get('__pp_run');
  try {
    const proxy = fn(code, stdin || '', check || '');
    const res = proxy.toJs({ dict_converter: Object.fromEntries });
    proxy.destroy();
    self.postMessage({ type: 'result', id, ...res });
  } catch (err) {
    self.postMessage({ type: 'result', id, ok: false, errorType: 'InternalError', errorMsg: String(err), stdout: String(err), checkOk: false, checkMsg: '' });
  } finally {
    fn.destroy();
  }
};
