// Auth modal: Sign In & Sign Up tabbed dialog with validation, cloud sync, and error feedback.
import { api } from '../engine/api.js';
import { store } from '../engine/store.js';
import { modal, esc, toast } from '../ui/dom.js';

export function openAuthModal(initialTab = 'signin') {
  let activeTab = initialTab;

  const m = modal(`
    <div class="auth-modal">
      <div class="auth-tabs">
        <button class="auth-tab ${activeTab === 'signin' ? 'active' : ''}" id="tab-signin">Sign In</button>
        <button class="auth-tab ${activeTab === 'signup' ? 'active' : ''}" id="tab-signup">Create Account</button>
      </div>

      <div id="auth-panel-signin" class="${activeTab === 'signin' ? '' : 'hidden'}">
        <p class="muted small" style="margin-top:0.4rem;">Sign in to sync your coding progress across devices and track your rank.</p>
        <form id="form-signin">
          <label class="field">
            Email or Username
            <input id="si-identifier" type="text" placeholder="you@example.com" required autocomplete="username" />
          </label>
          <label class="field">
            Password
            <input id="si-password" type="password" placeholder="••••••••" required autocomplete="current-password" />
          </label>
          <div id="si-error" class="auth-error hidden"></div>
          <div class="modal-actions" style="margin-top:1.2rem;">
            <button type="submit" class="btn primary" id="btn-si-submit">Sign In</button>
          </div>
        </form>
      </div>

      <div id="auth-panel-signup" class="${activeTab === 'signup' ? '' : 'hidden'}">
        <p class="muted small" style="margin-top:0.4rem;">Join Codeethos to save badges, streaks, and certificates to the cloud.</p>
        <form id="form-signup">
          <label class="field">
            Email
            <input id="su-email" type="email" placeholder="ada@lovelace.org" required autocomplete="email" />
          </label>
          <label class="field">
            Username
            <input id="su-username" type="text" placeholder="lovelace" pattern="[a-zA-Z0-9_]{3,30}" title="3-30 letters, numbers, or underscores" required autocomplete="username" />
          </label>
          <label class="field">
            Display Name <small>(optional)</small>
            <input id="su-display" type="text" placeholder="Ada Lovelace" autocomplete="name" />
          </label>
          <label class="field">
            Password
            <input id="su-password" type="password" placeholder="At least 6 characters" minlength="6" required autocomplete="new-password" />
          </label>
          <div id="su-error" class="auth-error hidden"></div>
          <div class="modal-actions" style="margin-top:1.2rem;">
            <button type="submit" class="btn primary" id="btn-su-submit">Create Account</button>
          </div>
        </form>
      </div>
    </div>
  `);

  const q = (sel) => m.el.querySelector(sel);

  const setTab = (tab) => {
    activeTab = tab;
    q('#tab-signin').classList.toggle('active', tab === 'signin');
    q('#tab-signup').classList.toggle('active', tab === 'signup');
    q('#auth-panel-signin').classList.toggle('hidden', tab !== 'signin');
    q('#auth-panel-signup').classList.toggle('hidden', tab !== 'signup');
  };

  q('#tab-signin').onclick = () => setTab('signin');
  q('#tab-signup').onclick = () => setTab('signup');

  // Sign in submit
  const submitSignIn = async (e) => {
    if (e) e.preventDefault();
    const identifier = q('#si-identifier').value.trim();
    const password = q('#si-password').value;
    const errBox = q('#si-error');
    const submitBtn = q('#btn-si-submit');

    if (!identifier || !password) return;

    errBox.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';

    try {
      const user = await api.login({ identifier, password });
      toast(`👋 Welcome back, <b>${esc(user.display_name || user.username)}</b>!`, 'success');

      // Fetch cloud progress & merge
      try {
        const cloudProgress = await api.getCloudProgress();
        if (cloudProgress) {
          store.mergeCloud(cloudProgress);
        }
        // Then sync local back to cloud so nothing is lost
        await api.syncProgress(store.get());
      } catch (err) {
        console.warn('Initial progress sync warning:', err);
      }

      m.close();
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  };

  q('#form-signin').addEventListener('submit', submitSignIn);
  q('#btn-si-submit').addEventListener('click', submitSignIn);

  // Sign up submit
  const submitSignUp = async (e) => {
    if (e) e.preventDefault();
    const email = q('#su-email').value.trim();
    const username = q('#su-username').value.trim();
    const display_name = q('#su-display').value.trim();
    const password = q('#su-password').value;
    const errBox = q('#su-error');
    const submitBtn = q('#btn-su-submit');

    if (!email || !username || !password) return;

    errBox.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';

    try {
      const user = await api.register({ email, username, password, display_name });
      toast(`🎉 Account created! Welcome, <b>${esc(user.display_name || user.username)}</b>!`, 'success');

      // Push existing local progress to their new cloud account
      await api.syncProgress(store.get());

      m.close();
    } catch (err) {
      errBox.textContent = err.message;
      errBox.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  };

  q('#form-signup').addEventListener('submit', submitSignUp);
  q('#btn-su-submit').addEventListener('click', submitSignUp);
}
