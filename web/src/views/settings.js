// Settings modal: local LLM endpoint, model, connection test, progress reset.
import { store } from '../engine/store.js';
import { listModels } from '../engine/llm.js';
import { modal, esc, toast } from '../ui/dom.js';

const PRESETS = [
  { name: 'Codeethos AI (Built-in)', url: '/llm/v1' },
  { name: 'Ollama direct', url: 'http://localhost:11434/v1' },
  { name: 'LM Studio', url: 'http://localhost:1234/v1' },
  { name: 'llama.cpp local', url: 'http://localhost:8080/v1' },
];

export function openSettings() {
  const s = store.get().settings;
  const m = modal(`
    <h2>⚙️ Settings</h2>
    <h3>🤖 Local AI tutor</h3>
    <p class="muted">Any OpenAI-compatible server works (Ollama, LM Studio, llama.cpp, vLLM…).</p>
    <div class="presets">${PRESETS.map((p) => `<button class="chip" data-url="${p.url}">${p.name}</button>`).join('')}</div>
    <label class="field">Base URL<input id="set-url" value="${esc(s.llmUrl)}" placeholder="/llm/v1" /></label>
    <label class="field">
      Model
      <div class="row" style="gap:0.5rem; align-items:center;">
        <input id="set-model" value="${esc(s.model)}" placeholder="e.g. qwen2.5-coder, llama3.1" style="flex:1;" />
        <select id="set-model-select" style="display:none; flex:1; max-width:65%;"></select>
        <button class="btn sm ghost" id="set-test" type="button" style="white-space:nowrap;">🔌 Test & list models</button>
      </div>
    </label>
    <label class="field">API key <small>(optional)</small><input id="set-key" type="password" value="${esc(s.apiKey)}" placeholder="leave empty for local servers" /></label>
    <div id="set-status" class="muted small" style="margin-top:0.3rem;"></div>
    <details class="help"><summary>Connection tips</summary>
      <p><b>/llm/v1</b> is proxied by the dev server to <code>http://localhost:11434</code> (Ollama), so no CORS setup is needed. Change the target with <code>$env:LLM_TARGET="http://localhost:1234"</code> before <code>npm run dev</code>.</p>
      <p>Using a direct URL with Ollama or llama.cpp? Make sure CORS is enabled (e.g. <code>--host 0.0.0.0</code> or <code>OLLAMA_ORIGINS=*</code>).</p>
    </details>
    <div class="modal-actions">
      <button class="btn danger ghost" id="set-reset">Reset progress</button>
      <button class="btn primary" id="set-save">Save</button>
    </div>`);
  const q = (x) => m.el.querySelector(x);
  m.el.querySelectorAll('.chip').forEach((c) => (c.onclick = () => (q('#set-url').value = c.dataset.url)));

  const modelInput = q('#set-model');
  const modelSelect = q('#set-model-select');

  modelSelect.onchange = () => {
    if (modelSelect.value) {
      modelInput.value = modelSelect.value;
    }
  };

  q('#set-test').onclick = async () => {
    store.setSettings({ llmUrl: q('#set-url').value.trim(), apiKey: q('#set-key').value.trim() });
    const st = q('#set-status');
    st.textContent = 'Connecting to server…';
    try {
      const models = await listModels();
      if (models.length) {
        modelSelect.innerHTML = models.map((x) => `<option value="${esc(x)}" ${x === modelInput.value ? 'selected' : ''}>${esc(x)}</option>`).join('');
        modelSelect.style.display = 'block';
        if (!models.includes(modelInput.value)) {
          modelInput.value = models[0];
        }
        st.innerHTML = `✅ Connected! Found ${models.length} model(s): <b>${models.map(esc).join(', ')}</b>`;
      } else {
        st.innerHTML = `⚠️ Connected, but server reported 0 models. Type model name manually.`;
      }
    } catch (e) {
      st.innerHTML = `❌ ${esc(e.message)} — check server URL & CORS settings`;
    }
  };
  q('#set-save').onclick = () => {
    store.setSettings({ llmUrl: q('#set-url').value.trim() || '/llm/v1', model: q('#set-model').value.trim(), apiKey: q('#set-key').value.trim() });
    toast('Settings saved', 'success');
    m.close();
  };
  q('#set-reset').onclick = () => {
    if (confirm('Reset ALL progress, XP and badges?')) {
      store.reset();
      m.close();
      location.hash = '#/';
      location.reload();
    }
  };
}
