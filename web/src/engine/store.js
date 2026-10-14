// Progress store: XP, levels, streaks, badges, settings — persisted in localStorage.

const KEY = 'codeethos:v1';
const LEGACY_KEY = 'python-profesor:v1';

const DEFAULTS = {
  xp: 0,
  steps: {}, // { "1.1": [0,1,2] } completed step indexes
  lessons: [], // completed lesson ids
  attempts: {}, // { "1.1:4": 2 } failed challenge attempts
  badges: [],
  streak: { last: null, count: 0 },
  drafts: {}, // saved editor code per step
  journey: {
    track: 'all',
    activeWeeks: [1, 2, 3, 4, 5, 6, 7, 8],
    openAccess: false,
  },
  settings: {
    llmUrl: '/llm/v1',
    model: 'llama3.1',
    apiKey: '',
  },
};

export const BADGES = {
  first_run: { icon: '🚀', name: 'Lift Off', desc: 'Ran your first code challenge' },
  first_challenge: { icon: '🏆', name: 'Challenger', desc: 'Passed your first coding challenge' },
  bug_slayer: { icon: '🐛', name: 'Bug Slayer', desc: 'Fixed failing code until all tests passed' },
  sharp_eye: { icon: '🔮', name: 'Sharp Eye', desc: 'Predicted 3 outputs right on the first try' },
  quiz_ace: { icon: '🧠', name: 'Quiz Ace', desc: 'Scored 5/5 on a quiz' },
  asked_ai: { icon: '🤖', name: 'Curious Mind', desc: 'Asked Codeethos AI for guidance' },
  week1: { icon: '🎓', name: 'Module 1 Graduate', desc: 'Completed all of Module 1' },
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY));
    return raw ? {
      ...structuredClone(DEFAULTS),
      ...raw,
      journey: { ...DEFAULTS.journey, ...(raw.journey || {}) },
      settings: { ...DEFAULTS.settings, ...(raw.settings || {}) }
    } : structuredClone(DEFAULTS);
  } catch {
    return structuredClone(DEFAULTS);
  }
}
function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((fn) => fn(state));
}

export const store = {
  get: () => state,
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  level(xp = state.xp) {
    return Math.floor(Math.sqrt(xp / 60)) + 1;
  },
  levelProgress(xp = state.xp) {
    const lv = this.level(xp);
    const lo = 60 * (lv - 1) ** 2;
    const hi = 60 * lv ** 2;
    return { lv, pct: ((xp - lo) / (hi - lo)) * 100, toNext: hi - xp };
  },

  addXp(amount) {
    state.xp += amount;
    const today = new Date().toDateString();
    if (state.streak.last !== today) {
      const yesterday = new Date(Date.now() - 864e5).toDateString();
      state.streak.count = state.streak.last === yesterday ? state.streak.count + 1 : 1;
      state.streak.last = today;
    }
    save();
  },

  /** returns true if newly earned */
  award(id) {
    if (state.badges.includes(id)) return false;
    state.badges.push(id);
    save();
    return true;
  },

  isStepDone(lessonId, idx) {
    return (state.steps[lessonId] || []).includes(idx);
  },
  completeStep(lessonId, idx) {
    const arr = (state.steps[lessonId] ||= []);
    if (arr.includes(idx)) return false;
    arr.push(idx);
    save();
    return true;
  },
  isLessonDone: (id) => state.lessons.includes(id),
  completeLesson(id) {
    if (state.lessons.includes(id)) return false;
    state.lessons.push(id);
    save();
    return true;
  },

  failAttempt(key) {
    state.attempts[key] = (state.attempts[key] || 0) + 1;
    save();
    return state.attempts[key];
  },
  attempts: (key) => state.attempts[key] || 0,

  getDraft: (key) => state.drafts[key],
  setDraft(key, code) {
    state.drafts[key] = code;
    localStorage.setItem(KEY, JSON.stringify(state)); // silent save, no re-render
  },

  setSettings(patch) {
    state.settings = { ...state.settings, ...patch };
    save();
  },

  getJourney() {
    return state.journey || DEFAULTS.journey;
  },

  setJourney(patch) {
    state.journey = { ...(state.journey || DEFAULTS.journey), ...patch };
    save();
  },

  bump(counter) {
    state[counter] = (state[counter] || 0) + 1;
    save();
    return state[counter];
  },

  mergeCloud(cloud) {
    if (!cloud) return;
    state.xp = Math.max(state.xp || 0, cloud.xp || 0);
    const cloudLessons = Array.isArray(cloud.lessons) ? cloud.lessons : [];
    state.lessons = [...new Set([...(state.lessons || []), ...cloudLessons])];
    
    const cloudBadges = Array.isArray(cloud.badges) ? cloud.badges : [];
    state.badges = [...new Set([...(state.badges || []), ...cloudBadges])];
    
    if (cloud.steps && typeof cloud.steps === 'object') {
      state.steps ||= {};
      for (const [lessonId, stepIndices] of Object.entries(cloud.steps)) {
        const local = state.steps[lessonId] || [];
        state.steps[lessonId] = [...new Set([...local, ...(Array.isArray(stepIndices) ? stepIndices : [])])];
      }
    }
    
    if (cloud.streak_days) {
      if ((cloud.streak_days || 0) > (state.streak?.count || 0)) {
        state.streak = { count: cloud.streak_days, last: cloud.last_active || state.streak?.last };
      }
    }
    save();
  },

  reset() {
    state = structuredClone(DEFAULTS);
    save();
  },
};
