// Web Worker that runs real Python 3 (Pyodide / WebAssembly).
// Running in a worker means an infinite loop can never freeze the page:
// the main thread simply terminates this worker after a timeout.

const PYODIDE_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

// Python harness: runs student code with a fake stdin (input()), captures
// output, and optionally runs a hidden "check" script for auto-grading.
const HARNESS = String.raw`
import sys, io, traceback, builtins

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
  const { id, code, stdin, check } = e.data;
  await ready;
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
