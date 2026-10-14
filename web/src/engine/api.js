// API client for Codeethos backend (FastAPI / SQLite)
// Handles JWT tokens, authentication state, progress sync, newsletter, and admin API.

const TOKEN_KEY = 'codeethos:token';
const USER_KEY = 'codeethos:user';
const LEGACY_TOKEN_KEY = 'python-profesor:token';
const LEGACY_USER_KEY = 'python-profesor:user';

let currentUser = null;
try {
  const cached = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
  if (cached) currentUser = JSON.parse(cached);
} catch {
  currentUser = null;
}

const authListeners = new Set();

export const api = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    }
  },

  getUser() {
    return currentUser;
  },

  setUser(user) {
    currentUser = user;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
    authListeners.forEach((fn) => fn(currentUser));
  },

  onAuthChange(fn) {
    authListeners.add(fn);
    return () => authListeners.delete(fn);
  },

  isLoggedIn() {
    return Boolean(this.getToken() && currentUser);
  },

  isAdmin() {
    return Boolean(currentUser && currentUser.role === 'admin');
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
  },

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const errorMsg = data?.detail || `HTTP ${res.status}: ${res.statusText}`;
      if (res.status === 401) {
        // Token expired or invalid
        this.logout();
      }
      throw new Error(errorMsg);
    }

    return data;
  },

  // Auth
  async register({ email, username, password, display_name }) {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password, display_name }),
    });
    this.setToken(res.access_token);
    this.setUser(res.user);
    return res.user;
  },

  async login({ identifier, password }) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    this.setToken(res.access_token);
    this.setUser(res.user);
    return res.user;
  },

  async checkAuth() {
    if (!this.getToken()) {
      this.setUser(null);
      return null;
    }
    try {
      const user = await this.request('/api/auth/me');
      this.setUser(user);
      return user;
    } catch {
      this.logout();
      return null;
    }
  },

  // Profile
  async updateProfile({ display_name, bio, avatar_seed }) {
    const user = await this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ display_name, bio, avatar_seed }),
    });
    this.setUser(user);
    return user;
  },

  // Progress Sync
  async getCloudProgress() {
    return this.request('/api/progress');
  },

  async syncProgress(storeData) {
    if (!this.isLoggedIn()) return null;
    try {
      return await this.request('/api/progress/sync', {
        method: 'POST',
        body: JSON.stringify({
          xp: storeData.xp || 0,
          lessons: storeData.lessons || [],
          steps: storeData.steps || {},
          badges: storeData.badges || [],
          streak_days: storeData.streak?.count || 0,
          last_active: storeData.streak?.last || null,
        }),
      });
    } catch (err) {
      console.warn('Progress sync failed:', err.message);
      return null;
    }
  },

  // Newsletter
  async subscribeNewsletter(email) {
    return this.request('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Admin
  async getAdminMetrics() {
    return this.request('/api/admin/metrics');
  },

  async getAdminUsers() {
    const res = await this.request('/api/admin/users');
    return Array.isArray(res) ? res : (res?.users || []);
  },

  async updateUserRole(userId, role) {
    return this.request(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async getAdminSubscribers() {
    const res = await this.request('/api/admin/newsletter/subscribers');
    return Array.isArray(res) ? res : (res?.subscribers || []);
  },

  async broadcastCampaign({ subject, content }) {
    return this.request('/api/admin/newsletter/broadcast', {
      method: 'POST',
      body: JSON.stringify({ subject, content }),
    });
  },
};
