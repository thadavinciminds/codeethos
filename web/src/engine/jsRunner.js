// In-browser sandboxed JavaScript code execution (Phase 2)
// Runs student JS code in an isolated Web Worker with captured console.log and timeout protection.

const JS_TIMEOUT_MS = 5000;

const WORKER_BLOB_CODE = `
self.onmessage = function(e) {
  const { id, code, tests } = e.data;
  const logs = [];
  const customConsole = {
    log: function(...args) {
      logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    },
    error: function(...args) {
      logs.push('[error] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    },
    warn: function(...args) {
      logs.push('[warn] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    }
  };

  try {
    const wrappedFn = new Function('console', code);
    wrappedFn(customConsole);
    const stdout = logs.join('\\n');
    self.postMessage({ id, ok: true, stdout, error: '' });
  } catch (err) {
    self.postMessage({
      id,
      ok: false,
      stdout: logs.join('\\n'),
      error: err.name + ': ' + err.message
    });
  }
};
`;

let workerUrl = null;

function getWorkerUrl() {
  if (!workerUrl) {
    const blob = new Blob([WORKER_BLOB_CODE], { type: 'application/javascript' });
    workerUrl = URL.createObjectURL(blob);
  }
  return workerUrl;
}

/**
 * Run JavaScript code in isolated Web Worker
 * @param {string} code
 * @returns {Promise<{ok: boolean, stdout: string, error: string, timeout?: boolean}>}
 */
export async function runJavaScript(code) {
  const id = Math.random().toString(36).substring(2, 9);
  const worker = new Worker(getWorkerUrl());

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        ok: false,
        timeout: true,
        stdout: '',
        error: `JavaScript execution timed out after ${JS_TIMEOUT_MS / 1000}s (possible infinite loop).`
      });
    }, JS_TIMEOUT_MS);

    worker.onmessage = (e) => {
      if (e.data.id === id) {
        clearTimeout(timer);
        worker.terminate();
        resolve(e.data);
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({
        ok: false,
        stdout: '',
        error: err.message || 'Worker execution error'
      });
    };

    worker.postMessage({ id, code });
  });
}
