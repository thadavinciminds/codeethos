// Admin Dashboard view: KPIs, user management, role modification, newsletter broadcast.
import { api } from '../engine/api.js';
import { openAuthModal } from './authModal.js';
import { h, esc, toast } from '../ui/dom.js';

export async function renderAdmin(root) {
  const user = api.getUser();

  if (!user || user.role !== 'admin') {
    root.innerHTML = `
      <section class="admin-view fade-in">
        <div class="glass" style="text-align:center; padding:3rem 1.5rem; max-width:600px; margin:2rem auto;">
          <h2>🚫 Admin Privileges Required</h2>
          <p class="muted">You must be logged in as an administrator to view this control panel.</p>
          <div style="margin-top:1.5rem; display:flex; justify-content:center; gap:0.8rem;">
            <a href="#/" class="btn ghost">← Back to Curriculum</a>
            <button class="btn primary" id="btn-admin-login">Sign in as Admin</button>
          </div>
        </div>
      </section>
    `;
    const btn = root.querySelector('#btn-admin-login');
    if (btn) {
      btn.onclick = () => {
        openAuthModal('signin');
      };
    }
    return;
  }

  root.innerHTML = `
    <section class="admin-view fade-in">
      <div style="padding:2rem; text-align:center;" class="muted">Loading administrative records…</div>
    </section>
  `;

  try {
    const [metrics, users, subscribers] = await Promise.all([
      api.getAdminMetrics(),
      api.getAdminUsers(),
      api.getAdminSubscribers(),
    ]);

    const view = h(`
      <section class="admin-view fade-in">
        <header class="admin-header">
          <div>
            <span class="pill">system administration</span>
            <h1>Admin Control Panel</h1>
            <p class="muted">Monitor platform adoption, manage student credentials, and broadcast newsletter updates.</p>
          </div>
          <div class="admin-actions">
            <button class="btn ghost sm" id="btn-admin-refresh">🔄 Refresh Data</button>
          </div>
        </header>

        <!-- KPI Metrics Grid -->
        <div class="admin-kpis">
          <div class="kpi-card glass">
            <span class="kpi-title">Total Users</span>
            <span class="kpi-val grad">${metrics.total_users}</span>
            <small class="muted">Registered accounts</small>
          </div>
          <div class="kpi-card glass">
            <span class="kpi-title">Active Learners</span>
            <span class="kpi-val">${metrics.active_learners}</span>
            <small class="muted">Students with XP > 0</small>
          </div>
          <div class="kpi-card glass">
            <span class="kpi-title">Total XP Earned</span>
            <span class="kpi-val">${metrics.total_xp_awarded.toLocaleString()}</span>
            <small class="muted">Across all learners</small>
          </div>
          <div class="kpi-card glass">
            <span class="kpi-title">Lessons Finished</span>
            <span class="kpi-val">${metrics.total_lessons_completed}</span>
            <small class="muted">Course submissions</small>
          </div>
          <div class="kpi-card glass">
            <span class="kpi-title">Newsletter Audience</span>
            <span class="kpi-val" style="color:var(--green);">${metrics.total_subscribers}</span>
            <small class="muted">Subscribed readers</small>
          </div>
        </div>

        <!-- Section 1: User Directory & Role Promotion -->
        <h2 class="section-title">Learners Directory (${users.length})</h2>
        <div class="glass" style="overflow-x:auto;">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Display Name</th>
                <th>Role</th>
                <th>XP</th>
                <th>Streak</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${users
                .map(
                  (u) => `
                <tr id="user-row-${u.id}">
                  <td><code>#${u.id}</code></td>
                  <td><b>${esc(u.username)}</b></td>
                  <td class="muted">${esc(u.email)}</td>
                  <td>${esc(u.display_name || '—')}</td>
                  <td><span class="role-badge role-${u.role}">${u.role}</span></td>
                  <td><b>${u.xp || 0}</b></td>
                  <td>${u.streak_days ? `${u.streak_days}d` : '0d'}</td>
                  <td class="small muted">${u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    ${
                      u.id === user.id
                        ? `<small class="muted">(You)</small>`
                        : `<button class="btn xs ghost btn-toggle-role" data-id="${u.id}" data-role="${u.role}">
                            ${u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                          </button>`
                    }
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- Section 2: Newsletter Broadcast & Subscribers -->
        <h2 class="section-title">Newsletter Broadcast & Subscribers</h2>
        <div class="admin-two-col">
          <!-- Campaign Composer -->
          <div class="glass" style="padding:1.4rem;">
            <h3>✉️ Dispatch Announcement / Digest</h3>
            <p class="muted small" style="margin-top:0.3rem;">Send a newsletter broadcast to all ${subscribers.length} verified subscriber(s).</p>
            <form id="form-broadcast" onsubmit="return false;" style="margin-top:1rem;">
              <label class="field">
                Subject Line
                <input id="bc-subject" required placeholder="Codeethos Weekly: New Tracks & Interactive Challenges" />
              </label>
              <label class="field">
                Email Content
                <textarea id="bc-content" rows="6" required style="background:transparent; color:var(--text); border:1px solid var(--line-strong); border-radius:var(--radius); padding:0.6rem; font-family:var(--font); font-size:0.88rem; outline:none; resize:vertical;" placeholder="Hello students! This week we are exploring Week 3 object-oriented Python techniques..."></textarea>
              </label>
              <div style="display:flex; justify-content:flex-end; gap:0.6rem; margin-top:1rem;">
                <button type="submit" class="btn primary" id="btn-bc-send">🚀 Dispatch Broadcast</button>
              </div>
            </form>
          </div>

          <!-- Subscribers List -->
          <div class="glass" style="padding:1.4rem; max-height:480px; overflow-y:auto;">
            <h3>Subscribers List (${subscribers.length})</h3>
            <p class="muted small" style="margin-top:0.3rem;">Opted-in email addresses for updates & new courses.</p>
            ${
              subscribers.length === 0
                ? `<p class="muted small" style="margin-top:1.5rem; text-align:center;">No subscribers yet.</p>`
                : `<ul class="subscriber-list" style="list-style:none; padding:0; margin-top:1rem; display:grid; gap:0.4rem;">
                    ${subscribers
                      .map(
                        (sub) => `
                      <li style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0.6rem; border-bottom:1px solid var(--line); font-size:0.85rem;">
                        <span>${esc(sub.email)}</span>
                        <small class="muted">${sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString() : 'Active'}</small>
                      </li>
                    `
                      )
                      .join('')}
                  </ul>`
            }
          </div>
        </div>
      </section>
    `);

    // Handle refresh
    view.querySelector('#btn-admin-refresh').onclick = () => renderAdmin(root);

    // Handle role toggles
    view.querySelectorAll('.btn-toggle-role').forEach((btn) => {
      btn.onclick = async () => {
        const userId = parseInt(btn.dataset.id, 10);
        const currentRole = btn.dataset.role;
        const newRole = currentRole === 'admin' ? 'student' : 'admin';

        if (confirm(`Change user #${userId} role from '${currentRole}' to '${newRole}'?`)) {
          btn.disabled = true;
          try {
            await api.updateUserRole(userId, newRole);
            toast(`User role updated to ${newRole}`, 'success');
            renderAdmin(root);
          } catch (err) {
            toast(`Failed to update role: ${err.message}`, 'warn');
            btn.disabled = false;
          }
        }
      };
    });

    // Handle broadcast submission
    view.querySelector('#form-broadcast').onsubmit = async () => {
      const subject = view.querySelector('#bc-subject').value.trim();
      const content = view.querySelector('#bc-content').value.trim();
      const sendBtn = view.querySelector('#btn-bc-send');

      if (!subject || !content) return;

      if (!confirm(`Are you sure you want to broadcast this campaign to ${subscribers.length} subscriber(s)?`)) {
        return;
      }

      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending…';

      try {
        const res = await api.broadcastCampaign({ subject, content });
        toast(`📢 Broadcast queued: sent to ${res.sent_count} subscriber(s)!`, 'success');
        view.querySelector('#bc-subject').value = '';
        view.querySelector('#bc-content').value = '';
      } catch (err) {
        toast(`Broadcast failed: ${err.message}`, 'warn');
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = '🚀 Dispatch Broadcast';
      }
    };

    root.replaceChildren(view);
  } catch (err) {
    root.innerHTML = `
      <section class="admin-view fade-in">
        <div class="glass" style="padding:2rem; text-align:center;">
          <h2 style="color:var(--red);">Error loading admin data</h2>
          <p class="muted">${esc(err.message)}</p>
          <button class="btn primary sm" style="margin-top:1rem;" onclick="location.reload()">Retry</button>
        </div>
      </section>
    `;
  }
}
