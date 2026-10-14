// "Ask the Profesor" chat panel backed by a local OpenAI-compatible LLM.
import { streamChat, TUTOR_SYSTEM_PROMPT } from '../engine/llm.js';
import { store } from '../engine/store.js';
import { h, md, esc, toast } from '../ui/dom.js';
import { openSettings } from './settings.js';

let context = {};
let history = [];
let panel;
let abort = null;

export function setChatContext(ctx) {
  context = ctx;
}

function contextMessage() {
  if (!context.lesson) return 'The student is on the roadmap page.';
  return `Current lesson: ${context.lesson}
Current step: ${context.step}
${context.task ? `Challenge task: ${context.task}\n` : ''}Student code:
\`\`\`python
${context.code || ''}
\`\`\`
Last output:
\`\`\`
${(context.output || '(not run yet)').slice(-1500)}
\`\`\``;
}

export function initChat() {
  panel = document.getElementById('chat-panel');
  panel.innerHTML = `
    <div class="chat-head"><div><b>🤖 Codeethos AI</b><small id="chat-model"></small></div>
      <div><button class="icon-btn sm" id="chat-clear" title="Clear chat">🗑</button><button class="icon-btn sm" id="chat-close" title="Close">✕</button></div></div>
    <div class="chat-log" id="chat-log">
      <div class="msg bot">Hi! I'm your Codeethos coding tutor. I can see your code and output. Ask me anything — I'll guide you with hints rather than giving the answer away. 🙂</div>
    </div>
    <div class="chat-quick">
      <button data-q="Give me a hint for this step.">💡 Hint</button>
      <button data-q="Explain the concept of this step in simpler words.">🧒 Explain simply</button>
      <button data-q="Review my code.">🔍 Review</button>
    </div>
    <form class="chat-form" id="chat-form"><textarea id="chat-input" rows="2" placeholder="Ask the Profesor… (Enter to send)"></textarea><button class="btn primary sm" id="chat-send">Send</button></form>`;
  const modelLabel = () => (panel.querySelector('#chat-model').textContent = ` · ${store.get().settings.model}`);
  modelLabel();
  store.subscribe(modelLabel);
  panel.querySelector('#chat-close').onclick = closeChat;
  panel.querySelector('#chat-clear').onclick = () => {
    history = [];
    panel.querySelector('#chat-log').innerHTML = '<div class="msg bot">Fresh start! What would you like to know?</div>';
  };
  panel.querySelectorAll('.chat-quick button').forEach((b) => (b.onclick = () => send(b.dataset.q)));
  const input = panel.querySelector('#chat-input');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      panel.querySelector('#chat-form').requestSubmit();
    }
  });
  panel.querySelector('#chat-form').onsubmit = (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) send(text);
    input.value = '';
  };
}

export function openChat(prefill) {
  panel.classList.add('open');
  if (prefill) send(prefill);
  else panel.querySelector('#chat-input').focus();
}
export function closeChat() {
  panel.classList.remove('open');
}
export function toggleChat() {
  panel.classList.contains('open') ? closeChat() : openChat();
}

async function send(text) {
  if (abort) abort.abort();
  const log = panel.querySelector('#chat-log');
  log.append(h(`<div class="msg user">${esc(text)}</div>`));
  const bot = h('<div class="msg bot typing"><i></i><i></i><i></i></div>');
  log.append(bot);
  log.scrollTop = log.scrollHeight;

  const messages = [
    { role: 'system', content: TUTOR_SYSTEM_PROMPT },
    { role: 'system', content: contextMessage() },
    ...history.slice(-8),
    { role: 'user', content: text },
  ];
  abort = new AbortController();
  let full = '';
  try {
    await streamChat(
      messages,
      (tok) => {
        if (!full) bot.classList.remove('typing');
        full += tok;
        bot.innerHTML = md(full);
        log.scrollTop = log.scrollHeight;
      },
      abort.signal,
    );
    history.push({ role: 'user', content: text }, { role: 'assistant', content: full });
    if (store.award('asked_ai')) toast('🤖 <b>Badge unlocked:</b> Curious Mind', 'badge');
  } catch (err) {
    if (err.name === 'AbortError') return;
    bot.classList.remove('typing');
    bot.classList.add('error');
    bot.innerHTML = `⚠ Could not reach your local LLM.<br><small>${esc(err.message)}</small><br><button class="btn xs ghost" id="chat-fix">⚙ Open AI settings</button>`;
    bot.querySelector('#chat-fix').onclick = openSettings;
  } finally {
    abort = null;
  }
}
