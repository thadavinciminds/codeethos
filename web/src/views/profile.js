// User Profile view: Display stats, badges, account settings, bio editor, and cloud sync.
import { api } from '../engine/api.js';
import { store, BADGES } from '../engine/store.js';
import { curriculum } from '../content/curriculum.js';
import { openAuthModal } from './authModal.js';
import { h, esc, toast } from '../ui/dom.js';

export async function renderProfile(root) {
  const user = api.getUser();

  if (!user) {
    root.innerHTML = `
      <section class="profile-view fade-in">
        <div class="glass profile-card" style="text-align:center; padding:3rem 1.5rem;">
          <h2>🔒 Access Restricted</h2>
          <p class="muted">Please sign in or create an account to view and manage your profile.</p>
          <div style="margin-top:1.5rem;">
            <button class="btn primary big" id="btn-profile-signin">Sign In / Register</button>
          </div>
        </div>
      </section>
    `;
    root.querySelector('#btn-profile-signin').onclick = () => {
      openAuthModal('signin');
    };
    return;
  }

  const s = store.get();
  const { lv, pct, toNext } = store.levelProgress();
  const totalLessons = curriculum.flatMap((w) => w.lessons).length;
  const doneLessons = s.lessons.length;
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently';

  const view = h(`
    <section class="profile-view fade-in">
      <div class="profile-header glass">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar">${user.avatar_seed || '🐍'}</div>
        </div>
        <div class="profile-info">
          <div class="profile-title-row">
            <h1>${esc(user.display_name || user.username)}</h1>
            <span class="role-badge role-${user.role}">${user.role}</span>
          </div>
          <div class="profile-meta muted">
            <span>@${esc(user.username)}</span> · 
            <span>${esc(user.email)}</span> · 
            <span>Member since ${joinDate}</span>
          </div>
          <p class="profile-bio">${esc(user.bio || 'Codeethos student building cool software.')}</p>
        </div>
        <div class="profile-top-actions">
          <button class="btn ghost sm" id="btn-sync-now" title="Synchronize local progress with cloud">☁️ Sync Cloud</button>
          <button class="btn danger sm" id="btn-logout">Sign Out</button>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="profile-stats-grid">
        <div class="stat-box glass">
          <span class="stat-label">Level</span>
          <span class="stat-val grad">Lv ${lv}</span>
          <div class="xp-bar" style="width:100%; margin-top:0.5rem;"><i style="width:${pct}%"></i></div>
          <small class="muted">${toNext} XP to next level</small>
        </div>
        <div class="stat-box glass">
          <span class="stat-label">Total Experience</span>
          <span class="stat-val">${s.xp} <small style="font-size:0.6em; color:var(--muted)">XP</small></span>
          <small class="muted">Gained from coding challenges</small>
        </div>
        <div class="stat-box glass">
          <span class="stat-label">Daily Streak</span>
          <span class="stat-val">🔥 ${s.streak?.count || 0}d</span>
          <small class="muted">Active consecutive learning days</small>
        </div>
        <div class="stat-box glass">
          <span class="stat-label">Curriculum Completion</span>
          <span class="stat-val">${doneLessons} / ${totalLessons}</span>
          <small class="muted">${Math.round((doneLessons / totalLessons) * 100)}% of 8-week curriculum</small>
        </div>
      </div>

      <!-- Edit Profile Details -->
      <div class="glass profile-edit-section">
        <h3>Edit Profile Details</h3>
        <form id="form-edit-profile" onsubmit="return false;" style="margin-top:1rem;">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
            <label class="field">
              Display Name
              <input id="edit-display-name" value="${esc(user.display_name || '')}" placeholder="Your preferred name" />
            </label>
            <label class="field">
              Avatar Emoji
              <input id="edit-avatar" value="${esc(user.avatar_seed || '🐍')}" placeholder="e.g. 🐍, ⚡, 🚀, 💻" />
            </label>
          </div>
          <label class="field" style="margin-top:0.8rem;">
            Personal Bio
            <textarea id="edit-bio" rows="3" style="background:transparent; color:var(--text); border:1px solid var(--line-strong); border-radius:var(--radius); padding:0.5rem 0.7rem; font-family:var(--font); font-size:0.88rem; outline:none; resize:vertical;" placeholder="Write a short bio about what you are building with Codeethos...">${esc(user.bio || '')}</textarea>
          </label>
          <div style="display:flex; justify-content:flex-end; gap:0.6rem; margin-top:1rem;">
            <button type="submit" class="btn primary" id="btn-save-profile">Save Changes</button>
          </div>
        </form>
      </div>

      <!-- Badges Earned Section -->
      <h2 class="section-title">Your Badges (${s.badges.length} / ${Object.keys(BADGES).length})</h2>
      <div class="badges">
        ${Object.entries(BADGES)
          .map(([id, b]) => `
            <div class="badge ${s.badges.includes(id) ? 'earned' : ''}" title="${b.desc}">
              <span>${b.icon}</span>
              <b>${b.name}</b>
              <small>${b.desc}</small>
            </div>
          `)
          .join('')}
      </div>
    </section>
  `);

  // Handle Cloud Sync
  view.querySelector('#btn-sync-now').onclick = async () => {
    const btn = view.querySelector('#btn-sync-now');
    btn.disabled = true;
    btn.textContent = 'Syncing…';
    try {
      const res = await api.syncProgress(store.get());
      toast('☁️ Progress saved and synced with cloud database!', 'success');
    } catch (err) {
      toast(`Sync error: ${err.message}`, 'warn');
    } finally {
      btn.disabled = false;
      btn.textContent = '☁️ Sync Cloud';
    }
  };

  // Handle Logout
  view.querySelector('#btn-logout').onclick = () => {
    if (confirm('Are you sure you want to sign out?')) {
      api.logout();
      toast('Signed out successfully');
      location.hash = '#/';
    }
  };

  // Handle Save Profile
  view.querySelector('#form-edit-profile').onsubmit = async () => {
    const saveBtn = view.querySelector('#btn-save-profile');
    const display_name = view.querySelector('#edit-display-name').value.trim();
    const avatar_seed = view.querySelector('#edit-avatar').value.trim() || '🐍';
    const bio = view.querySelector('#edit-bio').value.trim();

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    try {
      const updated = await api.updateProfile({ display_name, avatar_seed, bio });
      toast('Profile updated!', 'success');
      renderProfile(root);
    } catch (err) {
      toast(`Failed to update profile: ${err.message}`, 'warn');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  };

  root.replaceChildren(view);
}
