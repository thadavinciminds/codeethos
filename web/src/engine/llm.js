// Client for any OpenAI-compatible local LLM server
// (Ollama, LM Studio, llama.cpp server, vLLM, LocalAI...).

import { store } from './store.js';
import { api } from './api.js';

export const BUILTIN_LLM = '/llm/v1';
export const BUILTIN_MODEL = 'qwen38-27b-abl';

function cfg() {
  const s = store.get().settings;
  const base = (s.llmUrl || BUILTIN_LLM).replace(/\/+$/, '');
  const builtin = base === BUILTIN_LLM;
  return {
    base,
    builtin,
    model: builtin ? (s.model || BUILTIN_MODEL) : s.model,
    key: builtin ? api.getToken() : s.apiKey,
  };
}

function headers(key) {
  const h = { 'Content-Type': 'application/json' };
  if (key) h.Authorization = `Bearer ${key}`;
  return h;
}

export async function listModels() {
  const { base, builtin, key } = cfg();
  if (builtin && !key) {
    throw new Error('Sign in to use the Codeethos AI tutor.');
  }

  const cleanBase = base.replace(/\/+$/, '');
  const urlsToTry = [
    `${cleanBase}/models`,
    cleanBase.endsWith('/v1') ? `${cleanBase.slice(0, -3)}/models` : `${cleanBase}/v1/models`,
    `${cleanBase}/props`,
    `${cleanBase}/api/tags`
  ];

  let lastErr = null;
  for (const u of urlsToTry) {
    try {
      const res = await fetch(u, { headers: headers(key) });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length) {
        return data.data.map((m) => m.id || m.name).filter(Boolean);
      }
      if (Array.isArray(data.models) && data.models.length) {
        return data.models.map((m) => m.name || m.model).filter(Boolean);
      }
      if (Array.isArray(data) && data.length) {
        return data.map((m) => (typeof m === 'string' ? m : m.id || m.name)).filter(Boolean);
      }
      if (data.default_generation_settings?.model) {
        return [data.default_generation_settings.model];
      }
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Could not fetch models. Check server URL and CORS.');
}

/**
 * Normalizes messages to conform strictly to all chat templates
 * (including Qwen, Llama 3, DeepSeek, and llama.cpp/Jinja).
 */
export function normalizeMessages(msgs) {
  // 1. Merge every system message into one at the top
  const sys = msgs
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .filter(Boolean)
    .join('\n\n');

  // 2. Keep only user and assistant turns with non-empty content
  let rest = msgs.filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content?.trim());

  // 3. Chat history must start with a user turn
  while (rest.length && rest[0].role !== 'user') {
    rest.shift();
  }

  // 4. Merge back-to-back messages with the same role
  rest = rest.reduce((acc, m) => {
    const last = acc[acc.length - 1];
    if (last && last.role === m.role) {
      last.content += '\n\n' + m.content;
    } else {
      acc.push({ role: m.role, content: m.content });
    }
    return acc;
  }, []);

  return sys ? [{ role: 'system', content: sys }, ...rest] : rest;
}

/**
 * Stream a chat completion. Calls onToken(text) for each chunk.
 * Returns the full reply.
 */
export async function streamChat(messages, onToken, signal) {
  const { base, builtin, model, key } = cfg();
  if (builtin && !key) {
    throw new Error('Sign in to use the Codeethos AI tutor.');
  }

  const normalized = normalizeMessages(messages);
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: headers(key),
    body: JSON.stringify({ model, messages: normalized, stream: true, temperature: 0.4 }),
    signal,
  });

  if (!res.ok || !res.body) {
    if (builtin && res.status === 401) {
      throw new Error('Your session expired — sign in again to use the tutor.');
    }
    if (res.status === 429) {
      throw new Error('The tutor is busy — wait a moment and try again.');
    }
    if (res.status === 413) {
      throw new Error("That's too much code for one question — try a smaller snippet.");
    }
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.error?.message || j?.detail || '';
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(`Tutor error ${res.status}${detail ? ': ' + detail.slice(0, 200) : ''}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const payload = t.slice(5).trim();
      if (payload === '[DONE]') return full;
      try {
        const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onToken(delta);
        }
      } catch {
        /* partial JSON line, ignore */
      }
    }
  }
  return full;
}

export const TUTOR_SYSTEM_PROMPT = `You are the Codeethos AI Tutor, a friendly, encouraging expert programming mentor for learners.
Rules:
- Teach Socratically: ask a guiding question or give a hint BEFORE showing code.
- NEVER write the complete solution to the current challenge. Small snippets (1-3 lines) illustrating a concept are OK.
- Keep answers short (under 150 words), use simple English and markdown.
- Point out common pitfalls: missing colons, indentation, = vs ==, shadowing built-ins, mutable defaults, is vs ==, type errors from input().
- When reviewing code: first praise one thing, then point to at most 2 issues with line numbers, then ask a question.`;
