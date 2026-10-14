// Settings modal: local LLM endpoint, model, connection test, progress reset.
import { store } from '../engine/store.js';
import { listModels } from '../engine/llm.js';
import { modal, esc, toast } from '../ui/dom.js';

const PRESETS = [
  { name: 'Ollama (via proxy)', url: '/llm/v1' },
  { name: 'Ollama direct', url: 'http://localhost:11434/v1' },
  { name: 'LM Studio', url: 'http://localhost:1234/v1' },
  { name: 'llama.cpp server', url: 'http://localhost:8080/v1' },
];

export function openSettings() {
  const s = store.get().settings;
  const m = modal(`
    <h2>⚙️ Settings</h2>
    <h3>🤖 Local AI tutor</h3>
    <p class="muted">Any OpenAI-compatible server works (Ollama, LM Studio, llama.cpp, vLLM…).</p>
    <div class="presets">${PRESETS.map((p) => `<button class="chip" data-url="${p.url}">${p.name}</button>`).join('')}</div>
    <label class="field">Base URL<input id="set-url" value="${esc(s.llmUrl)}" placeholder="/llm/v1" /></label>
    <label class="field">Model<div class="row"><input id="set-model" list="model-list" value="${esc(s.model)}" placeholder="llama3.1" /><button class="btn sm ghost" id="set-test">🔌 Test & list models</button></div></label>
    <datalist id="model-list"></datalist>
    <label class="field">API key <small>(optional)</small><input id="set-key" type="password" value="${esc(s.apiKey)}" placeholder="leave empty for local servers" /></label>
    <div id="set-status" class="muted small"></div>
    <details class="help"><summary>Connection tips</summary>
      <p><b>/llm/v1</b> is proxied by the dev server to <code>http://localhost:11434</code> (Ollama), so no CORS setup is needed. Change the target with <code>$env:LLM_TARGET="http://localhost:1234"</code> before <code>npm run dev</code>.</p>
      <p>Using a direct URL with Ollama? Set <code>OLLAMA_ORIGINS=*</code> and restart Ollama.</p>
    </details>
    <div class="modal-actions">
      <button class="btn danger ghost" id="set-reset">Reset progress</button>
      <button class="btn primary" id="set-save">Save</button>
    </div>`);
  const q = (x) => m.el.querySelector(x);
  m.el.querySelectorAll('.chip').forEach((c) => (c.onclick = () => (q('#set-url').value = c.dataset.url)));

  q('#set-test').onclick = async () => {
    store.setSettings({ llmUrl: q('#set-url').value.trim(), apiKey: q('#set-key').value.trim() });
    const st = q('#set-status');
    st.textContent = 'Connecting…';
    try {
      const models = await listModels();
      q('#model-list').innerHTML = models.map((x) => `<option value="${esc(x)}">`).join('');
      st.innerHTML = `✅ Connected — ${models.length} model(s): ${models.slice(0, 6).map(esc).join(', ')}`;
      if (models.length && !models.includes(q('#set-model').value)) q('#set-model').value = models[0];
    } catch (e) {
      st.innerHTML = `❌ ${esc(e.message)} — is your LLM server running?`;
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
