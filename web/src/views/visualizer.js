// Python Tutor-style execution trace visualizer (Phase 1)
// Stepper: First, Prev, Next, Last, Auto-play. Syncs active line with editor and displays live variables & stdout.
import { tracePython } from '../engine/pyRunner.js';
import { esc } from '../ui/dom.js';

export async function openVisualizer({ code, stdin = '', editor }) {
  const root = document.getElementById('modal-root');
  if (!root) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop visualizer-backdrop fade-in';
  overlay.innerHTML = `
    <div class="modal visualizer-modal glass">
      <div class="visualizer-header">
        <div class="viz-title-group">
          <span class="viz-badge">TRACE</span>
          <h3>Execution Step Visualizer</h3>
        </div>
        <button class="icon-btn sm" id="btn-viz-close" title="Close visualizer">✕</button>
      </div>

      <div class="visualizer-loading" id="viz-loading">
        <span class="spinner"></span> Tracing execution frames in WebAssembly...
      </div>

      <div class="visualizer-content" id="viz-content" hidden>
        <!-- Stepper Controls Bar -->
        <div class="viz-controls">
          <div class="viz-btn-group">
            <button class="btn sm ghost" id="viz-first" title="First step">|◀</button>
            <button class="btn sm ghost" id="viz-prev" title="Previous step">◀ Prev</button>
            <button class="btn sm primary" id="viz-next" title="Next step">Next ▶</button>
            <button class="btn sm ghost" id="viz-last" title="Last step">▶|</button>
            <button class="btn sm ghost" id="viz-play" title="Auto step">▶ Play</button>
          </div>
          <div class="viz-step-counter" id="viz-counter">Step 0 / 0</div>
        </div>

        <div class="viz-grid">
          <!-- Code line pointer -->
          <div class="viz-panel viz-line-panel">
            <div class="viz-subhead">CURRENT EXECUTION POINT</div>
            <div class="viz-cur-line" id="viz-cur-line">
              <span class="line-arrow">➜</span>
              <span class="line-num" id="viz-num">Line -</span>
              <code class="line-text" id="viz-text">...</code>
            </div>

            <!-- Frames & Variables -->
            <div class="viz-subhead" style="margin-top:1.2rem;">CALL FRAME & VARIABLES</div>
            <div class="viz-vars-wrap" id="viz-vars">
              <span class="muted small">No variables initialized yet.</span>
            </div>
          </div>

          <!-- Output Panel -->
          <div class="viz-panel viz-out-panel">
            <div class="viz-subhead">TERMINAL STDOUT AT THIS STEP</div>
            <pre class="viz-stdout" id="viz-stdout"><span class="muted">(no output)</span></pre>
            <div id="viz-error-box" class="viz-err-box" hidden></div>
          </div>
        </div>
      </div>
    </div>
  `;

  root.appendChild(overlay);

  const close = () => {
    clearInterval(playTimer);
    overlay.remove();
  };
  overlay.querySelector('#btn-viz-close').onclick = close;

  let steps = [];
  let curIdx = 0;
  let playTimer = null;
  const codeLines = code.split('\n');

  try {
    const res = await tracePython(code, stdin);
    const loadingEl = overlay.querySelector('#viz-loading');
    const contentEl = overlay.querySelector('#viz-content');
    loadingEl.hidden = true;

    if (!res.ok && (!res.steps || res.steps.length === 0)) {
      contentEl.hidden = false;
      overlay.querySelector('#viz-content').innerHTML = `
        <div class="callout warn" style="margin:1rem 0;">
          <b>Execution failed:</b> ${esc(res.error || 'Syntax or runtime error')}<br>
          <small class="muted">Check your syntax in the editor and try again.</small>
        </div>
      `;
      return;
    }

    steps = res.steps;
    if (steps.length === 0) {
      contentEl.hidden = false;
      overlay.querySelector('#viz-content').innerHTML = `
        <div class="callout" style="margin:1rem 0;">
          No executable lines traced. Make sure your script has active executable statements.
        </div>
      `;
      return;
    }

    contentEl.hidden = false;

    const counterEl = overlay.querySelector('#viz-counter');
    const curNumEl = overlay.querySelector('#viz-num');
    const curTextEl = overlay.querySelector('#viz-text');
    const varsEl = overlay.querySelector('#viz-vars');
    const stdoutEl = overlay.querySelector('#viz-stdout');
    const errBox = overlay.querySelector('#viz-error-box');

    const firstBtn = overlay.querySelector('#viz-first');
    const prevBtn = overlay.querySelector('#viz-prev');
    const nextBtn = overlay.querySelector('#viz-next');
    const lastBtn = overlay.querySelector('#viz-last');
    const playBtn = overlay.querySelector('#viz-play');

    function renderCurrentStep() {
      const s = steps[curIdx];
      if (!s) return;

      counterEl.textContent = `Step ${curIdx + 1} / ${steps.length}`;
      curNumEl.textContent = `Line ${s.line}`;
      const lineContent = codeLines[s.line - 1] || '';
      curTextEl.textContent = lineContent.trim();

      // Highlight line in main editor
      if (editor?.goToLine) {
        editor.goToLine(s.line);
      }

      // Render variables table
      const keys = Object.keys(s.locals || {});
      if (keys.length === 0) {
        varsEl.innerHTML = '<span class="muted small">No local variables defined yet.</span>';
      } else {
        const prevLocals = curIdx > 0 ? (steps[curIdx - 1].locals || {}) : {};
        varsEl.innerHTML = `
          <table class="viz-table">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${keys.map((k) => {
                const item = s.locals[k];
                const prev = prevLocals[k];
                const isChanged = !prev || prev.val !== item.val;
                return `
                  <tr class="${isChanged ? 'var-updated' : ''}">
                    <td class="var-name"><code>${esc(k)}</code></td>
                    <td class="var-type"><span class="pill-type">${esc(item.type)}</span></td>
                    <td class="var-val"><code>${esc(item.val)}</code></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
      }

      // Render stdout
      stdoutEl.textContent = s.stdout ? s.stdout : '(no output yet)';

      // Check if exception happened at final step
      if (!res.ok && curIdx === steps.length - 1 && res.error) {
        errBox.hidden = false;
        errBox.innerHTML = `<b>💥 Exception on line ${res.errorLine || s.line}:</b> ${esc(res.error)}`;
      } else {
        errBox.hidden = true;
      }

      firstBtn.disabled = curIdx === 0;
      prevBtn.disabled = curIdx === 0;
      nextBtn.disabled = curIdx === steps.length - 1;
      lastBtn.disabled = curIdx === steps.length - 1;
    }

    firstBtn.onclick = () => { curIdx = 0; renderCurrentStep(); };
    prevBtn.onclick = () => { if (curIdx > 0) { curIdx--; renderCurrentStep(); } };
    nextBtn.onclick = () => { if (curIdx < steps.length - 1) { curIdx++; renderCurrentStep(); } };
    lastBtn.onclick = () => { curIdx = steps.length - 1; renderCurrentStep(); };

    playBtn.onclick = () => {
      if (playTimer) {
        clearInterval(playTimer);
        playTimer = null;
        playBtn.textContent = '▶ Play';
      } else {
        if (curIdx >= steps.length - 1) curIdx = 0;
        playBtn.textContent = '⏸ Pause';
        playTimer = setInterval(() => {
          if (curIdx < steps.length - 1) {
            curIdx++;
            renderCurrentStep();
          } else {
            clearInterval(playTimer);
            playTimer = null;
            playBtn.textContent = '▶ Play';
          }
        }, 750);
      }
    };

    renderCurrentStep();
  } catch (err) {
    overlay.querySelector('#viz-loading').textContent = `Visualizer error: ${err.message}`;
  }
}
