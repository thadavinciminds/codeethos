// App bootstrap: router, top bar stats, Python engine status, cloud auth & sync.
import './styles/index.css';
import { store } from './engine/store.js';
import { api } from './engine/api.js';
import { initPython, onStatus } from './engine/pyRunner.js';
import { renderRoadmap } from './views/roadmap.js';
import { renderLanding } from './views/landing.js';
import { renderLesson } from './views/lesson.js';
import { renderProfile } from './views/profile.js';
import { renderAdmin } from './views/admin.js';
import { openAuthModal } from './views/authModal.js';
import { initChat, toggleChat } from './views/chat.js';
import { openSettings } from './views/settings.js';
import { openProModal } from './views/proModal.js';
import { esc } from './ui/dom.js';

const app = document.getElementById('app');

function updateActiveNav(page) {
  const homeLink = document.getElementById('nav-home');
  const roadmapLink = document.getElementById('nav-roadmap');
  if (homeLink) homeLink.classList.toggle('active', !page || page === 'home');
  if (roadmapLink) roadmapLink.classList.toggle('active', page === 'roadmap' || page === 'curriculum');
}

function route() {
  const [, page, id, step] = location.hash.replace(/^#\/?/, '#/').split('/');
  if (page === 'lesson' && id) {
    // Lazy-load Python WebAssembly only when an interactive lesson is opened
    initPython().catch(() => {});
    renderLesson(app, id, step);
    updateActiveNav('lesson');
  } else if (page === 'roadmap' || page === 'curriculum') {
    renderRoadmap(app);
    updateActiveNav('roadmap');
  } else if (page === 'profile') {
    renderProfile(app);
    updateActiveNav('profile');
  } else if (page === 'admin') {
    renderAdmin(app);
    updateActiveNav('admin');
  } else {
    renderLanding(app);
    updateActiveNav('home');
  }
  window.scrollTo(0, 0);
}

function renderStats() {
  const s = store.get();
  const { lv, pct, toNext } = store.levelProgress();
  const spree = s.spree?.current || 0;
  document.getElementById('stats').innerHTML = `
    <div class="stat" title="Daily streak">streak <b>${s.streak?.count || 0}d</b></div>
    ${spree > 1 ? `<div class="stat spree" title="Sharpshooter spree: consecutive challenges passed on first attempt" style="color:var(--accent);">🎯 <b>${spree} spree</b></div>` : ''}
    <div class="stat level" title="${toNext} XP to next level">
      <span class="lv">lv${lv}</span>
      <span class="xp-bar"><i style="width:${pct}%"></i></span>
      <b>${s.xp}xp</b>
    </div>
    <div class="stat" title="Badges">badges <b>${s.badges?.length || 0}</b></div>`;
}

function renderAuthNav() {
  const user = api.getUser();
  const el = document.getElementById('auth-actions');
  if (!el) return;

  if (!user) {
    el.innerHTML = `<button class="btn sm ghost" id="btn-auth-signin" title="Sign In or Register">sign in</button>`;
    el.querySelector('#btn-auth-signin').onclick = () => openAuthModal('signin');
  } else {
    const avatarHtml = user.avatar_url
      ? `<img src="${esc(user.avatar_url)}" alt="${esc(user.username)}" class="user-avatar-tiny" style="width:22px; height:22px; border-radius:4px; object-fit:cover; vertical-align:middle; display:inline-block; border:1px solid var(--line-strong);" />`
      : `<span class="user-emoji">${esc(user.avatar_seed || '🐍')}</span>`;

    el.innerHTML = `
      ${user.role === 'admin' ? `<a href="#/admin" class="icon-btn" id="btn-topbar-admin" title="Admin Dashboard">admin</a>` : ''}
      <a href="#/profile" class="btn sm ghost user-nav-btn" id="btn-topbar-profile" title="View Profile">
        ${avatarHtml}
        <b>${esc(user.username)}</b>
      </a>
    `;
  }
}

onStatus((status, detail) => {
  const el = document.getElementById('py-status');
  el.className = `py-status ${status}`;
  el.querySelector('em').textContent =
    status === 'ready' ? 'python ready' : status === 'error' ? 'python failed' : 'python loading';
  if (status === 'error') el.title = detail;
});

document.getElementById('btn-settings').onclick = openSettings;
document.getElementById('btn-chat').onclick = toggleChat;

// Background auto-sync on store changes
let syncTimer = null;
store.subscribe((state) => {
  renderStats();
  if (api.isLoggedIn()) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      api.syncProgress(state);
    }, 1500);
  }
});

// React to authentication changes
api.onAuthChange((user) => {
  renderAuthNav();
  const hash = location.hash;
  if (hash.startsWith('#/profile') || hash.startsWith('#/admin')) {
    route();
  }
});

// Check cloud session & merge cloud progress on startup
async function initSession() {
  renderAuthNav();
  if (api.getToken()) {
    try {
      const user = await api.checkAuth();
      if (user) {
        api.setUser(user);
        renderAuthNav();
        const cloudProgress = await api.getCloudProgress();
        if (cloudProgress) {
          store.mergeCloud(cloudProgress);
        }
      } else {
        api.logout();
        renderAuthNav();
      }
    } catch (e) {
      console.warn('Session resume notice:', e);
      api.logout();
      renderAuthNav();
    }
  }
}

// Allow manual pre-load of Python on demand
const pyStatusEl = document.getElementById('py-status');
if (pyStatusEl) {
  pyStatusEl.style.cursor = 'pointer';
  pyStatusEl.onclick = () => {
    initPython().catch(() => {});
  };
}

const proBtn = document.getElementById('nav-pro');
if (proBtn) {
  proBtn.onclick = openProModal;
}

initChat();
renderStats();
renderAuthNav();
window.addEventListener('hashchange', route);
route();
initSession();


