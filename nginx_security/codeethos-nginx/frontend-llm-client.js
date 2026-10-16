// Frontend change for the authenticated /llm/ proxy.
//
// Today the tutor sends settings.apiKey as the Bearer token for every LLM URL.
// With the proxy, the built-in "/llm/v1" endpoint must send the learner's
// Codeethos login token instead (nginx checks it, then swaps in the llama.cpp
// key server-side). Custom URLs (Ollama/LM Studio on localhost) keep using
// the user's own key as before.
//
// Replace the existing llmConfig()/llmHeaders() helpers (minified as gf/yf)
// with these. `auth` is your existing auth client (minified as `ce`) that has
// getToken().

const BUILTIN_LLM = "/llm/v1";
const BUILTIN_MODEL = "qwen38-27b-abl";   // the model learners should use

function llmConfig() {
  const s = store.get().settings;
  const base = (s.llmUrl || BUILTIN_LLM).replace(/\/+$/, "");
  const builtin = base === BUILTIN_LLM;
  return {
    base,
    builtin,
    model: builtin ? BUILTIN_MODEL : s.model,          // learners can't pick a 99 GB model
    key: builtin ? auth.getToken() : s.apiKey,          // Codeethos token vs. user's own key
  };
}

function llmHeaders(key) {
  const h = { "Content-Type": "application/json" };
  if (key) h.Authorization = `Bearer ${key}`;
  return h;
}

// Before calling the built-in tutor, make sure the learner is signed in,
// and turn proxy status codes into readable messages.
async function chatCompletion(messages, signal) {
  const { base, builtin, model, key } = llmConfig();
  if (builtin && !key) throw new Error("Sign in to use the Codeethos AI tutor.");

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: llmHeaders(key),
    body: JSON.stringify({ model, messages: normalizeMessages(messages), stream: true, temperature: 0.4 }),
    signal,
  });

  if (!res.ok || !res.body) {
    if (builtin && res.status === 401) throw new Error("Your session expired — sign in again to use the tutor.");
    if (res.status === 429) throw new Error("The tutor is busy — wait a moment and try again.");
    if (res.status === 413) throw new Error("That's too much code for one question — try a smaller snippet.");
    let detail = "";
    try { detail = (await res.json())?.error?.message || ""; } catch {}
    throw new Error(`Tutor error ${res.status}${detail ? ": " + detail.slice(0, 200) : ""}`);
  }
  return res.body.getReader();   // existing SSE parsing continues from here
}
