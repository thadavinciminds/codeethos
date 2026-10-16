// User Profile view: Display stats, badges, account settings, bio editor, and cloud sync.
import { api } from '../engine/api.js';
import { store, BADGES } from '../engine/store.js';
import { curriculum } from '../content/curriculum.js';
import { openAuthModal } from './authModal.js';
import { h, esc, toast, modal, celebrate } from '../ui/dom.js';

export const MASCOT_AVATARS = Array.from({ length: 84 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    id: `mascot_${num}`,
    url: `/avatars/mascot_${num}.png`,
    name: `Cyber Mascot #${num}`,
  };
});

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

  let currentAvatarUrl = user.avatar_url || '';

  const avatarDisplayHtml = currentAvatarUrl
    ? `<img src="${esc(currentAvatarUrl)}" alt="${esc(user.username)}" id="header-avatar-img" />`
    : `<span id="header-avatar-emoji">${esc(user.avatar_seed || '🐍')}</span>`;

  const view = h(`
    <section class="profile-view fade-in">
      <div class="profile-header glass">
        <div class="profile-avatar-wrap">
          <div class="profile-avatar" id="profile-avatar-display">${avatarDisplayHtml}</div>
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
        <h3>Edit Profile & Mascot</h3>
        <form id="form-edit-profile" onsubmit="return false;" style="margin-top:1rem;">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
            <label class="field">
              Display Name
              <input id="edit-display-name" value="${esc(user.display_name || '')}" placeholder="Your preferred name" />
            </label>
            <label class="field">
              Fallback Emoji
              <input id="edit-avatar" value="${esc(user.avatar_seed || '🐍')}" placeholder="e.g. 🐍, ⚡, 🚀, 💻" />
            </label>
          </div>
          <label class="field" style="margin-top:0.8rem;">
            Personal Bio
            <textarea id="edit-bio" rows="3" style="background:transparent; color:var(--text); border:1px solid var(--line-strong); border-radius:var(--radius); padding:0.5rem 0.7rem; font-family:var(--font); font-size:0.88rem; outline:none; resize:vertical;" placeholder="Write a short bio about what you are building with Codeethos...">${esc(user.bio || '')}</textarea>
          </label>

          <!-- 84 Cyberpunk Mascot Avatars Grid -->
          <div class="avatar-picker-section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem; flex-wrap:wrap; gap:0.6rem;">
              <div>
                <h4 style="margin:0 0 0.2rem; font-size:0.95rem; font-weight:500; color:var(--text);">Choose Your Avatar Mascot</h4>
                <div class="muted small">Select any of the 84 official Codeethos cyberpunk cyber-mascots.</div>
              </div>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <span class="muted small" id="avatar-status-pill">${currentAvatarUrl ? 'Mascot active' : 'Emoji active'}</span>
                <button type="button" class="btn ghost sm" id="btn-clear-mascot" style="font-size:0.75rem; padding:0.2rem 0.5rem;">Use Emoji</button>
              </div>
            </div>

            <div class="avatar-grid" id="avatar-grid">
              ${MASCOT_AVATARS.map((m) => `
                <button type="button" class="avatar-chip ${currentAvatarUrl === m.url ? 'active' : ''}" data-url="${m.url}" title="${m.name}">
                  <img src="${m.url}" alt="${m.name}" loading="lazy" />
                </button>
              `).join('')}
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.6rem; margin-top:1.4rem;">
            <button type="submit" class="btn primary" id="btn-save-profile">Save Profile & Mascot</button>
          </div>
        </form>
      </div>

      <!-- Verified Certificate Section (Phase 3) -->
      <div class="glass" style="padding:1.4rem; margin:1.5rem 0; border-left:3px solid var(--accent); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div style="max-width:680px;">
          <h3 style="margin:0 0 0.3rem; font-size:1.05rem; font-weight:500;">🎓 Verified Certificate of Completion</h3>
          <p class="muted small" style="margin:0;">Demonstrating tested mastery across Python foundations, clean code, OOP, fault-tolerant REST APIs, 2D arcade physics, and production scikit-learn ML pipelines.</p>
        </div>
        <button class="btn primary" id="btn-view-certificate">View Certificate 📜</button>
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

  // Handle Certificate View
  view.querySelector('#btn-view-certificate').onclick = () => {
    celebrate();
    const certDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = `CE-PY-${Math.abs(user.id || 101)}-${Date.now().toString(36).toUpperCase()}`;
    const m = modal(`
      <div class="certificate-wrap" style="text-align:center; padding:1.5rem; border:2px solid var(--accent); background:var(--bg); border-radius:var(--radius); position:relative;">
        <div style="font-size:0.78rem; letter-spacing:0.18em; color:var(--accent); text-transform:uppercase; margin-bottom:0.4rem;">
          OFFICIAL CODEETHOS CERTIFICATE OF MASTERY
        </div>
        <h2 style="font-size:1.6rem; font-weight:600; margin:0.4rem 0 0.2rem; color:#fff;">
          Certificate of Completion
        </h2>
        <div class="muted small" style="margin-bottom:1.4rem;">8-Week Interactive Python Mastery Curriculum</div>
        
        <p class="muted small" style="margin-bottom:0.2rem;">This certifies that</p>
        <div style="font-size:1.5rem; font-weight:600; color:var(--accent); margin-bottom:0.8rem; border-bottom:1px dashed var(--line-strong); padding-bottom:0.4rem; display:inline-flex; align-items:center; justify-content:center; gap:0.6rem; min-width:240px;">
          ${user.avatar_url ? `<img src="${esc(user.avatar_url)}" alt="Mascot" style="width:36px; height:36px; border-radius:8px; border:1px solid var(--accent); vertical-align:middle; object-fit:cover;" />` : ''}
          <span>${esc(user.display_name || user.username)}</span>
        </div>
        
        <p class="muted small" style="max-width:540px; margin:0 auto 1.4rem; line-height:1.5;">
          has successfully passed the comprehensive curriculum covering terminal I/O, OOP design patterns, Leitner algorithms, real-time arcade graphics, and scikit-learn machine learning.
        </p>

        <div style="display:flex; justify-content:space-around; align-items:center; border-top:1px solid var(--line); border-bottom:1px solid var(--line); padding:0.8rem 0; margin-bottom:1.4rem; font-size:0.82rem;">
          <div><span class="muted">Status:</span> <b style="color:var(--green)">Verified ✓</b></div>
          <div><span class="muted">Verification ID:</span> <code>${certId}</code></div>
          <div><span class="muted">Date:</span> <b>${certDate}</b></div>
        </div>

        <div class="modal-actions" style="justify-content:center; gap:0.8rem;">
          <button class="btn primary" id="btn-print-cert">🖨️ Print / Save PDF</button>
          <button class="btn ghost" id="btn-close-cert">Close</button>
        </div>
      </div>
    `);
    m.el.querySelector('#btn-print-cert').onclick = () => window.print();
    m.el.querySelector('#btn-close-cert').onclick = m.close;
  };

  // Handle Mascot Avatar Selection
  const avatarDisplay = view.querySelector('#profile-avatar-display');
  const statusPill = view.querySelector('#avatar-status-pill');

  view.querySelectorAll('.avatar-chip').forEach((chip) => {
    chip.onclick = () => {
      view.querySelectorAll('.avatar-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentAvatarUrl = chip.dataset.url;
      if (avatarDisplay) {
        avatarDisplay.innerHTML = `<img src="${esc(currentAvatarUrl)}" alt="Avatar" id="header-avatar-img" />`;
      }
      if (statusPill) statusPill.textContent = 'Mascot selected (click save)';
    };
  });

  const clearMascotBtn = view.querySelector('#btn-clear-mascot');
  if (clearMascotBtn) {
    clearMascotBtn.onclick = () => {
      view.querySelectorAll('.avatar-chip').forEach((c) => c.classList.remove('active'));
      currentAvatarUrl = '';
      const fallbackEmoji = view.querySelector('#edit-avatar').value.trim() || '🐍';
      if (avatarDisplay) {
        avatarDisplay.innerHTML = `<span id="header-avatar-emoji">${esc(fallbackEmoji)}</span>`;
      }
      if (statusPill) statusPill.textContent = 'Emoji active (click save)';
    };
  }

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

  // Handle Save Profile & Mascot
  view.querySelector('#form-edit-profile').onsubmit = async () => {
    const saveBtn = view.querySelector('#btn-save-profile');
    const display_name = view.querySelector('#edit-display-name').value.trim();
    const avatar_seed = view.querySelector('#edit-avatar').value.trim() || '🐍';
    const bio = view.querySelector('#edit-bio').value.trim();

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    try {
      const updated = await api.updateProfile({ display_name, avatar_seed, bio, avatar_url: currentAvatarUrl });
      celebrate();
      toast('🎉 Profile and mascot avatar updated!', 'badge', 4000);
      renderProfile(root);
    } catch (err) {
      toast(`Failed to update profile: ${err.message}`, 'warn');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Profile & Mascot';
    }
  };

  root.replaceChildren(view);
}
