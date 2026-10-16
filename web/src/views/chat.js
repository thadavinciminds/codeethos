import { streamChat, TUTOR_SYSTEM_PROMPT } from '../engine/llm.js';
import { store } from '../engine/store.js';
import { h, md, esc, toast } from '../ui/dom.js';
import { openSettings } from './settings.js';
import { startVoiceRecognition, stopVoiceRecognition, isSTTSupported } from '../engine/voice.js';

let context = {};
let history = [];
let panel;
let abort = null;
let isRecording = false;

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
    <div class="chat-head">
      <div>
        <b>🤖 Codeethos AI</b>
        <small id="chat-model"></small>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span class="chat-hearts" id="chat-hearts" title="Socratic query hearts (recharges 1 every 3 min)"></span>
        <button class="icon-btn sm" id="chat-clear" title="Clear chat">🗑</button>
        <button class="icon-btn sm" id="chat-close" title="Close">✕</button>
      </div>
    </div>
    <div class="chat-log" id="chat-log">
      <div class="msg bot">Hi! I'm your Codeethos coding tutor. I can see your code and output. Ask me anything or speak into the mic — I'll guide you with hints rather than giving the answer away. 🙂</div>
    </div>
    <div class="chat-quick">
      <button data-q="Give me a hint for this step.">💡 Hint</button>
      <button data-q="Explain the concept of this step in simpler words.">🧒 Explain simply</button>
      <button data-q="Review my code.">🔍 Review</button>
    </div>
    <form class="chat-form" id="chat-form">
      <textarea id="chat-input" rows="2" placeholder="Ask or speak to the Profesor… (Enter to send)"></textarea>
      <button type="button" class="icon-btn" id="chat-mic" title="Voice Dictation (Speak your question)" style="height:32px; width:34px; padding:0;">🎤</button>
      <button class="btn primary sm" id="chat-send">Send</button>
    </form>`;
  
  const renderHearts = () => {
    const hInfo = store.getHearts();
    const el = panel.querySelector('#chat-hearts');
    if (el) el.innerHTML = `❤️ ${hInfo.count}/${hInfo.max}`;
  };

  const modelLabel = () => {
    panel.querySelector('#chat-model').textContent = ` · ${store.get().settings.model}`;
    renderHearts();
  };
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

  const micBtn = panel.querySelector('#chat-mic');
  if (micBtn) {
    if (!isSTTSupported) {
      micBtn.style.display = 'none';
    } else {
      micBtn.onclick = () => {
        if (isRecording) {
          stopVoiceRecognition();
          isRecording = false;
          micBtn.classList.remove('pulse');
          micBtn.textContent = '🎤';
        } else {
          isRecording = true;
          micBtn.classList.add('pulse');
          micBtn.textContent = '🔴';
          toast('🎙️ Listening... Speak your question now', 'info', 3000);
          startVoiceRecognition({
            onInterim: (text) => {
              input.value = text;
            },
            onFinal: (text) => {
              input.value = text;
              isRecording = false;
              micBtn.classList.remove('pulse');
              micBtn.textContent = '🎤';
              send(text);
              input.value = '';
            },
            onError: (err) => {
              isRecording = false;
              micBtn.classList.remove('pulse');
              micBtn.textContent = '🎤';
              toast(`Mic notice: ${err.error || err.message || 'Microphone stopped'}`, 'warn');
            },
            onEnd: () => {
              isRecording = false;
              micBtn.classList.remove('pulse');
              micBtn.textContent = '🎤';
            },
          });
        }
      };
    }
  }
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

  const hInfo = store.getHearts();
  if (hInfo.count <= 0) {
    toast('❤️ Out of tutor hearts! Recharges 1 every 3 min, or open a Loot Chest on the roadmap.', 'warn', 5000);
    log.append(h('<div class="msg error"><b>Out of hearts!</b><br>Each Socratic guidance question costs 1 heart. Hearts recharge 1 every 3 minutes. Unlock a Loot Chest on the roadmap to refill immediately.</div>'));
    log.scrollTop = log.scrollHeight;
    return;
  }
  store.useHeart();
  const heartsEl = panel.querySelector('#chat-hearts');
  if (heartsEl) heartsEl.innerHTML = `❤️ ${store.getHearts().count}/${store.getHearts().max}`;

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
    const isNetwork = err instanceof TypeError || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError');
    const errTitle = isNetwork ? '⚠ Could not reach your LLM server.' : '⚠ LLM Server error.';
    bot.innerHTML = `${errTitle}<br><small>${esc(err.message)}</small><br><button class="btn xs ghost" id="chat-fix">⚙ Open AI settings</button>`;
    bot.querySelector('#chat-fix').onclick = openSettings;
  } finally {
    abort = null;
  }
}
