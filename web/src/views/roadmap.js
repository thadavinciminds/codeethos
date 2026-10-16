// Roadmap (home) view: hero, customized journey overview, dynamic progress, module cards.
import { curriculum, TRACK_PRESETS, isUnlocked } from '../content/curriculum.js';
import { store, BADGES } from '../engine/store.js';
import { downloadTracker } from '../engine/tracker.js';
import { openJourneyModal } from './journeyModal.js';
import { api } from '../engine/api.js';
import { h, toast, modal, celebrate } from '../ui/dom.js';

export function renderRoadmap(root) {
  const s = store.get();
  const journey = store.getJourney();
  const activePreset = TRACK_PRESETS.find((p) => p.id === journey.track) || TRACK_PRESETS[0];

  // Calculate stats based on active journey modules
  const journeyWeeks = curriculum.filter((w) => journey.activeWeeks.includes(w.id));
  const journeyLessons = journeyWeeks.flatMap((w) => w.lessons);
  const totalJourneyLessons = Math.max(journeyLessons.length, 1);
  const doneJourneyLessons = journeyLessons.filter((l) => s.lessons.includes(l.id)).length;
  const next = journeyLessons.find((l) => !s.lessons.includes(l.id));
  const hearts = store.getHearts();

  const view = h(`
  <section class="roadmap fade-in">
    <div class="hero glass">
      <div class="hero-text">
        <span class="pill">interactive coding curriculum</span>
        <h1>Learn Code <span class="grad">fast</span> — by doing.</h1>
        <p>Bite-sized modules, in-browser execution, auto-graded challenges, and an intelligent AI tutor that guides you without giving the solution away.</p>
        
        <!-- Active Journey Banner -->
        <div class="hero-journey-bar">
          <div class="journey-badge">
            <span class="preset-icon">${activePreset.icon}</span>
            <div>
              <b>${activePreset.name}</b>
              <div class="muted small">${journey.activeWeeks.length} of ${curriculum.length} modules active${journey.openAccess ? ' · <span style="color:var(--green)">🔓 Free Roam</span>' : ' · <span style="color:var(--blue)">🛡️ Guided</span>'}</div>
            </div>
          </div>
          <button class="btn sm ghost" id="btn-customize-journey">🧭 Customize Journey</button>
        </div>

        <div class="hero-cta" style="margin-top:1.2rem;">
          ${next ? `<a class="btn primary big" id="btn-continue" href="#/lesson/${next.id}">${doneJourneyLessons ? 'Continue' : 'Start'}: ${next.emoji} ${next.title} →</a>` : `<span class="btn primary big">🎓 All active journey lessons complete!</span>`}
          <button class="btn ghost" id="btn-export">⬇ Export tracker</button>
        </div>
      </div>
      <div class="hero-ring">
        <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="ring-bg"/><circle cx="60" cy="60" r="52" class="ring-fg" style="stroke-dasharray:${(doneJourneyLessons / totalJourneyLessons) * 326.7} 326.7"/></svg>
        <div class="ring-label"><b>${doneJourneyLessons}/${totalJourneyLessons}</b><span>journey done</span></div>
      </div>
    </div>

    <!-- RPG Inventory & Loot Chests (Phase 2) -->
    <div class="rpg-strip glass">
      <div class="rpg-item" title="Streak Freezes protect your daily streak if you miss a day">
        <span class="rpg-icon">🛡️</span>
        <div><b>${s.freezes || 0} Freezes</b><small class="dim">Streak insurance</small></div>
      </div>
      <div class="rpg-item" title="Socratic AI Tutor hearts (recharge 1 every 3 minutes)">
        <span class="rpg-icon">❤️</span>
        <div><b>${hearts.count}/${hearts.max} Hearts</b><small class="dim">AI mentor energy</small></div>
      </div>
      <div class="rpg-item" title="Seer stones peek reference solutions without resetting your streak">
        <span class="rpg-icon">🔮</span>
        <div><b>${s.seerStones || 0} Seer Stones</b><small class="dim">Solution tokens</small></div>
      </div>
      <div class="rpg-item chests-group" title="Earned on sprees and module completions">
        <span class="rpg-icon">🎁</span>
        <div><b>${s.chests || 0} Mystery Chests</b><small class="dim">Contains rare study loot</small></div>
        <button class="btn sm primary ${s.chests > 0 ? 'pulse' : ''}" id="btn-open-chest" ${s.chests > 0 ? '' : 'disabled'}>Open Chest</button>
      </div>
    </div>

    <div class="how glass">
      ${['📖 Learn', '▶ See it run', '🔮 Predict', '💻 Code', '✅ Check'].map((t, i) => `<div class="how-step"><span>${i + 1}</span>${t}</div>`).join('<i class="how-arrow">→</i>')}
    </div>

    <div style="display:flex; justify-content:space-between; align-items:baseline; margin: 2.5rem 0 1rem;">
      <h2 class="section-title" style="margin:0;">Your Journey Modules (${journey.activeWeeks.length} Active)</h2>
      <button class="btn xs ghost" id="btn-manage-journey">Change Modules</button>
    </div>

    <div class="weeks">
      ${curriculum.map((w) => weekCard(w, s, journey)).join('')}
      <article class="week glass week-teaser" style="--wc:var(--accent);">
        <header><span class="week-num">+</span><h3>Next Languages</h3></header>
        <div class="soon" style="margin-top:0.6rem;">
          <span>JavaScript (ES2024)</span>
          <span>TypeScript</span>
          <span>Rust & WebAssembly</span>
          <span>Go Systems</span>
          <em>⚡ Upcoming interactive tracks for Codeethos</em>
        </div>
      </article>
    </div>

    <h2 class="section-title">Badges</h2>
    <div class="badges">
      ${Object.entries(BADGES).map(([id, b]) => `<div class="badge ${s.badges.includes(id) ? 'earned' : ''}" title="${b.desc}"><span>${b.icon}</span><b>${b.name}</b><small>${b.desc}</small></div>`).join('')}
    </div>

    <!-- Newsletter Promotion Section -->
    <div class="glass newsletter-banner" style="padding:2rem; margin:2.5rem 0 1rem; border-left:3px solid var(--accent);">
      <div style="max-width:680px;">
        <span class="pill">Stay Sharp · Codeethos Digest</span>
        <h3 style="margin:0.5rem 0 0.3rem; font-size:1.15rem; font-weight:500;">Subscribe to the Codeethos Newsletter</h3>
        <p class="muted small" style="margin:0.2rem 0 1.2rem;">Get weekly curated programming deep-dives, cheat sheets, interview tips, and early access to new language tracks.</p>
        <form id="form-roadmap-newsletter" onsubmit="return false;" style="display:flex; gap:0.6rem; flex-wrap:wrap;">
          <input id="nl-email" type="email" required placeholder="Enter your email (e.g. dev@codeethos.com)" style="flex:1; min-width:240px; background:var(--bg); color:var(--text); border:1px solid var(--line-strong); border-radius:var(--radius); padding:0.6rem 0.8rem; font-family:var(--font); font-size:0.85rem; outline:none;" />
          <button type="submit" class="btn primary" id="btn-nl-subscribe">Subscribe Free</button>
        </form>
      </div>
    </div>
  </section>`);

  const openCustomizer = () => openJourneyModal(() => renderRoadmap(root));

  view.querySelector('#btn-customize-journey').onclick = openCustomizer;
  view.querySelector('#btn-manage-journey').onclick = openCustomizer;

  const openChestBtn = view.querySelector('#btn-open-chest');
  if (openChestBtn) {
    openChestBtn.onclick = () => {
      const drop = store.openChest();
      if (!drop) return;
      celebrate(true);
      const m = modal(`
        <div style="text-align:center; padding:1.2rem;">
          <div style="font-size:3.2rem; margin-bottom:0.5rem; animation:pulseDot 1s infinite;">🎁</div>
          <h2 style="margin:0 0 0.5rem;">Loot Chest Unlocked!</h2>
          <div style="font-size:1.25rem; margin:1.2rem 0; color:var(--accent);">
            <b>${drop.name}</b>
          </div>
          <p class="muted small" style="margin-bottom:1.5rem;">${drop.desc}</p>
          <div class="modal-actions" style="justify-content:center;">
            <button class="btn primary big" id="btn-claim-reward">Claim Reward</button>
          </div>
        </div>
      `);
      m.el.querySelector('#btn-claim-reward').onclick = () => {
        m.close();
        renderRoadmap(root);
      };
    };
  }

  // Handle "+ Add" on inactive week cards
  view.querySelectorAll('.btn-add-week').forEach((btn) => {
    btn.onclick = () => {
      const wid = parseInt(btn.dataset.week, 10);
      const newWeeks = [...new Set([...journey.activeWeeks, wid])].sort((a, b) => a - b);
      store.setJourney({ activeWeeks: newWeeks, track: 'custom' });
      toast(`Added Module ${wid} to your journey!`, 'success');
      renderRoadmap(root);
    };
  });

  view.querySelector('#btn-export').onclick = () => {
    downloadTracker();
    toast('📄 CURRICULUM_TRACKER.md exported with your progress', 'success');
  };

  view.querySelector('#form-roadmap-newsletter').onsubmit = async () => {
    const emailInput = view.querySelector('#nl-email');
    const subBtn = view.querySelector('#btn-nl-subscribe');
    const email = emailInput.value.trim();
    if (!email) return;

    subBtn.disabled = true;
    subBtn.textContent = 'Subscribing…';

    try {
      await api.subscribeNewsletter(email);
      toast('🎉 You are now subscribed to the Codeethos newsletter!', 'success');
      emailInput.value = '';
    } catch (err) {
      toast(`Subscription notice: ${err.message}`, 'warn');
    } finally {
      subBtn.disabled = false;
      subBtn.textContent = 'Subscribe Free';
    }
  };

  root.replaceChildren(view);
}

function weekCard(w, s, journey) {
  const isInJourney = (journey?.activeWeeks || [1, 2, 3, 4, 5, 6, 7, 8]).includes(w.id);
  const playable = w.lessons.length > 0;

  const lessons = playable
    ? w.lessons
        .map((l) => {
          const done = s.lessons.includes(l.id);
          const open = isInJourney && isUnlocked(l.id, s.lessons, journey);
          const stepsDone = (s.steps[l.id] || []).length;
          const pct = Math.round((stepsDone / l.steps.length) * 100);
          return `<a class="lesson-row ${done ? 'done' : ''} ${open ? '' : 'locked'}" ${open ? `href="#/lesson/${l.id}"` : ''} id="lesson-link-${l.id.replace('.', '-')}">
            <span class="lesson-ico">${done ? '✅' : open ? l.emoji : '🔒'}</span>
            <span class="lesson-meta"><b>${l.id} · ${l.title}</b><small>${l.steps.length} steps · ~${l.minutes} min${l.project ? ' · PROJECT' : ''}</small>
            <span class="mini-bar"><i style="width:${pct}%"></i></span></span>
          </a>`;
        })
        .join('')
    : `<div class="soon">${(w.topics || w.lessons.map((l) => l.title)).map((t) => `<span>${t}</span>`).join('')}</div>`;

  return `<article class="week glass ${playable ? '' : 'week-locked'} ${isInJourney ? 'in-journey' : 'out-journey'}" style="--wc:${w.color}; ${isInJourney ? '' : 'opacity:0.45; border-style:dashed;'}">
    <header style="display:flex; justify-content:space-between; align-items:baseline;">
      <div style="display:flex; align-items:baseline; gap:0.6rem;">
        <span class="week-num">W${w.id}</span>
        <h3>${w.title}</h3>
      </div>
      ${isInJourney ? '' : `<button class="btn xs ghost btn-add-week" data-week="${w.id}" title="Include in your journey">+ Add to Journey</button>`}
    </header>
    ${lessons}
  </article>`;
}
