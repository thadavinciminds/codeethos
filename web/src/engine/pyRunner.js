// Main-thread wrapper around the Pyodide worker: promise-based runs + timeout.

const TIMEOUT_MS = 6000;

let worker = null;
let readyPromise = null;
let nextId = 1;
const pending = new Map();
const listeners = new Set();

export function onStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit(status, detail) {
  listeners.forEach((fn) => fn(status, detail));
}

function spawn() {
  worker = new Worker(new URL('./py.worker.js', import.meta.url), { type: 'module' });
  emit('loading');
  readyPromise = new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'ready') {
        emit('ready', msg.version);
        resolve();
      } else if (msg.type === 'load-error') {
        emit('error', msg.message);
        reject(new Error(msg.message));
      } else if (msg.type === 'result') {
        const p = pending.get(msg.id);
        if (p) {
          clearTimeout(p.timer);
          pending.delete(msg.id);
          p.resolve(msg);
        }
      }
    };
  });
}

export function initPython() {
  if (!worker) spawn();
  return readyPromise;
}

/**
 * Run Python code.
 * @param {string} code   student source
 * @param {string} stdin  lines fed to input()
 * @param {string} check  optional hidden Python check script
 */
export async function runPython(code, stdin = '', check = '') {
  await initPython();
  const id = nextId++;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      // Infinite loop (or waiting forever). Kill and respawn the worker.
      pending.delete(id);
      worker.terminate();
      worker = null;
      spawn();
      resolve({
        ok: false,
        timeout: true,
        errorType: 'Timeout',
        errorMsg: `Your code ran longer than ${TIMEOUT_MS / 1000}s and was stopped.`,
        stdout: '',
        checkOk: false,
        checkMsg: 'Timed out',
      });
    }, TIMEOUT_MS);
    pending.set(id, { resolve, timer });
    worker.postMessage({ id, code, stdin, check });
  });
}

/** Run all hidden tests for a challenge. */
export async function runTests(code, tests) {
  const results = [];
  for (const t of tests) {
    const r = await runPython(code, t.stdin || '', t.check || '');
    const passed = (r.ok || t.allowError) && r.checkOk;
    results.push({ name: t.name, passed, result: r, message: passed ? '' : (r.ok ? r.checkMsg : `${r.errorType}: ${r.errorMsg}`) });
  }
  return results;
}

/**
 * Step-by-step execution tracer for Python Tutor-style visualizer.
 * Returns { ok, steps: [{line, event, locals, stdout}], stdout, error, errorLine }
 */
export async function tracePython(code, stdin = '') {
  await initPython();
  const id = nextId++;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      worker.terminate();
      worker = null;
      spawn();
      resolve({
        ok: false,
        timeout: true,
        steps: [],
        stdout: '',
        error: 'Execution timed out (infinite loop detected).',
        errorLine: 0,
      });
    }, TIMEOUT_MS);
    pending.set(id, { resolve, timer });
    worker.postMessage({ id, mode: 'trace', code, stdin });
  });
}

