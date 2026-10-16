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
  spree: { current: 0, best: 0 },
  freezes: 2, // starts with 2 free streak freezes
  chests: 1, // starts with 1 free mystery chest
  seerStones: 1, // peek solution token
  hearts: { count: 10, max: 10, lastRecharge: Date.now() },
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
  sharpshooter_3: { icon: '🎯', name: 'Sharpshooter III', desc: '3 challenge submissions passed on the first try' },
  sharpshooter_5: { icon: '⚡', name: 'Master Marksman', desc: '5 challenge submissions passed on the first try' },
  sharpshooter_10: { icon: '🏹', name: 'Archmage Marksman', desc: '10 challenge submissions passed on the first try' },
  first_chest: { icon: '🎁', name: 'Treasure Hunter', desc: 'Opened a mystery loot chest' },
  streak_master: { icon: '🔥', name: 'Flamekeeper', desc: 'Reached a 7-day learning streak' },
  quiz_ace: { icon: '🧠', name: 'Quiz Ace', desc: 'Scored 5/5 on a quiz' },
  asked_ai: { icon: '🤖', name: 'Curious Mind', desc: 'Asked Codeethos AI for guidance' },
  week1: { icon: '🎓', name: 'Module 1 Graduate', desc: 'Completed all of Module 1' },
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY));
    if (!raw) return structuredClone(DEFAULTS);
    return {
      ...structuredClone(DEFAULTS),
      ...raw,
      freezes: raw.freezes != null ? raw.freezes : DEFAULTS.freezes,
      chests: raw.chests != null ? raw.chests : DEFAULTS.chests,
      seerStones: raw.seerStones != null ? raw.seerStones : DEFAULTS.seerStones,
      hearts: { ...DEFAULTS.hearts, ...(raw.hearts || {}) },
      journey: { ...DEFAULTS.journey, ...(raw.journey || {}) },
      settings: { ...DEFAULTS.settings, ...(raw.settings || {}) },
    };
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
      if (state.streak.last === yesterday) {
        state.streak.count = (state.streak.count || 0) + 1;
      } else if (state.streak.last && (state.freezes || 0) > 0) {
        // Streak freeze used automatically
        state.freezes -= 1;
        state.streak.count = (state.streak.count || 0) + 1;
        state.streakProtected = true;
      } else {
        state.streak.count = 1;
      }
      state.streak.last = today;
      if (state.streak.count >= 7) {
        this.award('streak_master');
      }
    }
    save();
  },

  getHearts() {
    if (!state.hearts) {
      state.hearts = { count: 10, max: 10, lastRecharge: Date.now() };
    }
    const elapsedMinutes = (Date.now() - (state.hearts.lastRecharge || Date.now())) / (1000 * 60);
    const recharged = Math.floor(elapsedMinutes / 3);
    if (recharged > 0 && state.hearts.count < state.hearts.max) {
      state.hearts.count = Math.min(state.hearts.max, state.hearts.count + recharged);
      state.hearts.lastRecharge = Date.now();
      save();
    }
    return state.hearts;
  },

  useHeart() {
    const h = this.getHearts();
    if (h.count <= 0) return false;
    h.count -= 1;
    save();
    return true;
  },

  refillHearts() {
    if (!state.hearts) state.hearts = { count: 10, max: 10, lastRecharge: Date.now() };
    state.hearts.count = state.hearts.max;
    state.hearts.lastRecharge = Date.now();
    save();
  },

  addChest(qty = 1) {
    state.chests = (state.chests || 0) + qty;
    save();
  },

  openChest() {
    if ((state.chests || 0) <= 0) return null;
    state.chests -= 1;
    this.award('first_chest');
    const drops = [
      { id: 'freeze', name: '🛡️ Streak Freeze', desc: 'Protects your daily streak if you miss a day.', apply: () => { state.freezes = (state.freezes || 0) + 1; } },
      { id: 'xp_boost', name: '🧪 150 XP Potion', desc: 'Surges 150 bonus XP toward your next level.', apply: () => { state.xp += 150; } },
      { id: 'hearts_refill', name: '❤️ Socratic Hearts Full Refill', desc: 'Instantly refills all 10 AI tutor questions.', apply: () => { this.refillHearts(); } },
      { id: 'seer_stone', name: '🔮 Seer Stone', desc: 'Solution token to peek logic without penalty.', apply: () => { state.seerStones = (state.seerStones || 0) + 1; } },
    ];
    const item = drops[Math.floor(Math.random() * drops.length)];
    item.apply();
    save();
    return item;
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

  recordSubmitSuccess(hadFails) {
    if (!state.spree) state.spree = { current: 0, best: 0 };
    if (!hadFails) {
      state.spree.current = (state.spree.current || 0) + 1;
      if (state.spree.current > (state.spree.best || 0)) {
        state.spree.best = state.spree.current;
      }
      save();
      return state.spree.current;
    } else {
      state.spree.current = 0;
      save();
      return 0;
    }
  },

  resetSpree() {
    if (!state.spree) state.spree = { current: 0, best: 0 };
    state.spree.current = 0;
    save();
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
