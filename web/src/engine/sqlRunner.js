// In-browser WebAssembly SQL Runner (Phase 2)
// Runs SQLite queries directly in the browser via sql.js with table formatting.

const SQL_WASM_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.js';
const SQL_WASM_BINARY = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm';

let SQL = null;
let initPromise = null;

export async function initSQL() {
  if (SQL) return SQL;
  if (!initPromise) {
    initPromise = new Promise((resolve, reject) => {
      // Check if initSqlJs is already loaded globally
      if (typeof window.initSqlJs === 'function') {
        window.initSqlJs({ locateFile: () => SQL_WASM_BINARY }).then((sql) => {
          SQL = sql;
          resolve(SQL);
        }).catch(reject);
      } else {
        const script = document.createElement('script');
        script.src = SQL_WASM_CDN;
        script.onload = () => {
          window.initSqlJs({ locateFile: () => SQL_WASM_BINARY }).then((sql) => {
            SQL = sql;
            resolve(SQL);
          }).catch(reject);
        };
        script.onerror = () => reject(new Error('Failed to load SQL WebAssembly runtime'));
        document.head.appendChild(script);
      }
    });
  }
  return initPromise;
}

/**
 * Execute SQL schema + queries in memory and return structured table rows
 * @param {string} sqlQueries
 * @returns {Promise<{ok: boolean, columns: string[], values: any[][], rowCount: number, error: string}>}
 */
export async function runSQL(sqlQueries) {
  try {
    const sqlEngine = await initSQL();
    const db = new sqlEngine.Database();
    const res = db.exec(sqlQueries);

    if (!res || res.length === 0) {
      db.close();
      return { ok: true, columns: [], values: [], rowCount: 0, error: '' };
    }

    const lastResult = res[res.length - 1];
    const columns = lastResult.columns;
    const values = lastResult.values;
    db.close();

    return {
      ok: true,
      columns,
      values,
      rowCount: values.length,
      error: '',
    };
  } catch (err) {
    return {
      ok: false,
      columns: [],
      values: [],
      rowCount: 0,
      error: err.message || 'SQL execution failed',
    };
  }
}
