// Voice engine: Text-to-Speech (TTS) for lesson read-aloud and Speech-to-Text (STT) for voice Q&A (Phase 3).

export const isSTTSupported = typeof window !== 'undefined' &&
  (window.SpeechRecognition != null || window.webkitSpeechRecognition != null);

export const isTTSSupported = typeof window !== 'undefined' &&
  window.speechSynthesis != null;

let currentUtterance = null;
let activeRecognition = null;

/**
 * Read text aloud using browser SpeechSynthesis.
 * @param {string} text Plain text or markdown to read
 * @param {object} options
 */
export function speakText(text, { onStart, onEnd, onError } = {}) {
  if (!isTTSSupported) {
    onError?.(new Error('Speech synthesis is not supported in this browser.'));
    return;
  }

  stopSpeaking();

  // Strip markdown formatting and code blocks for clean listening
  const clean = text
    .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[#*_~>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  // Prefer natural English voices if available
  const voices = window.speechSynthesis.getVoices();
  const natural = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
  if (natural) utterance.voice = natural;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };
  utterance.onerror = (e) => {
    currentUtterance = null;
    onError?.(e);
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isTTSSupported && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking() {
  return isTTSSupported && window.speechSynthesis.speaking;
}

/**
 * Listen to user voice via Web Speech API.
 * @param {object} options
 * @returns {() => void} Function to stop listening
 */
export function startVoiceRecognition({ onInterim, onFinal, onError, onEnd }) {
  if (!isSTTSupported) {
    onError?.(new Error('Speech recognition is not supported in this browser.'));
    return () => {};
  }

  stopVoiceRecognition();

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRec();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }
    if (final) onFinal?.(final);
    else if (interim) onInterim?.(interim);
  };

  recognition.onerror = (e) => {
    activeRecognition = null;
    onError?.(e);
  };

  recognition.onend = () => {
    activeRecognition = null;
    onEnd?.();
  };

  activeRecognition = recognition;
  try {
    recognition.start();
  } catch (err) {
    onError?.(err);
  }

  return stopVoiceRecognition;
}

export function stopVoiceRecognition() {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {}
    activeRecognition = null;
  }
}
