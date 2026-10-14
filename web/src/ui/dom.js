// Small UI helpers: DOM builder, tiny markdown, toasts, modal.

export const $ = (sel, root = document) => root.querySelector(sel);

export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function esc(s = '') {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Minimal, safe markdown for AI chat & pitfall text. */
export function md(src = '') {
  const blocks = [];
  let s = src.replace(/```(\w*)\n?([\s\S]*?)(```|$)/g, (_, lang, code) => {
    blocks.push(`<pre class="md-code"><code>${esc(code.replace(/\n$/, ''))}</code></pre>`);
    return `\u0000${blocks.length - 1}\u0000`;
  });
  s = esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>')
    .replace(/^#{1,4}\s+(.*)$/gm, '<b>$1</b>')
    .replace(/^\s*[-*]\s+(.*)$/gm, '• $1')
    .replace(/\n/g, '<br>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => blocks[i]);
}

export function toast(html, kind = 'info', ms = 3200) {
  const el = h(`<div class="toast ${kind}">${html}</div>`);
  document.getElementById('toast-root').append(el);
  setTimeout(() => el.classList.add('out'), ms);
  setTimeout(() => el.remove(), ms + 400);
}

export function modal(html, { onClose } = {}) {
  const root = document.getElementById('modal-root');
  const el = h(`<div class="modal-backdrop"><div class="modal glass">${html}<button class="modal-x" aria-label="Close">✕</button></div></div>`);
  const close = () => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 250);
    document.removeEventListener('keydown', onKey);
    onClose?.();
  };
  const onKey = (e) => e.key === 'Escape' && close();
  el.addEventListener('click', (e) => (e.target === el || e.target.classList.contains('modal-x')) && close());
  document.addEventListener('keydown', onKey);
  root.append(el);
  return { el, close };
}

// Intentionally quiet: no confetti in the terminal theme.
export function celebrate() {}

export function xpPop(amount, anchor) {
  const r = (anchor || document.body).getBoundingClientRect();
  const el = h(`<div class="xp-pop">+${amount} XP</div>`);
  el.style.left = `${r.left + r.width / 2}px`;
  el.style.top = `${r.top}px`;
  document.body.append(el);
  setTimeout(() => el.remove(), 1300);
}
