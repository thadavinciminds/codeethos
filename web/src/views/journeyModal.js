// Customizable Learning Journey Modal
// Allows students to select career track presets, hand-pick modules, and toggle open access mode.

import { store } from '../engine/store.js';
import { curriculum, TRACK_PRESETS, allLessons } from '../content/curriculum.js';
import { modal, esc, toast } from '../ui/dom.js';

export function openJourneyModal(onApplied) {
  const currentJourney = store.getJourney();
  let selectedTrack = currentJourney.track || 'all';
  let activeWeeks = new Set(currentJourney.activeWeeks || [1, 2, 3, 4, 5, 6, 7, 8]);
  let openAccess = Boolean(currentJourney.openAccess);

  const m = modal(`
    <div class="journey-modal">
      <header class="journey-modal-header">
        <span class="pill">personalized curriculum</span>
        <h2 style="margin:0.3rem 0; font-size:1.3rem;">🧭 Customize Your Learning Journey</h2>
        <p class="muted small" style="margin:0 0 1rem;">Choose a career track preset or hand-pick specific modules you want to master.</p>
      </header>

      <!-- Track Presets -->
      <h3 class="journey-subhead">1. Select a Career Track Preset</h3>
      <div class="journey-presets-grid">
        ${TRACK_PRESETS.map((p) => `
          <button class="journey-preset-card glass ${p.id === selectedTrack ? 'active' : ''}" data-track="${p.id}">
            <div class="preset-icon">${p.icon}</div>
            <div class="preset-body">
              <b>${p.name}</b>
              <span class="preset-tagline">${p.tagline}</span>
              <p class="muted small">${p.desc}</p>
            </div>
          </button>
        `).join('')}
      </div>

      <!-- Modules Selector -->
      <div class="journey-modules-head" style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem;">
        <h3 class="journey-subhead" style="margin:0;">2. Tailor Your Modules (${curriculum.length} Available)</h3>
        <div style="display:flex; gap:0.4rem;">
          <button class="btn xs ghost" id="btn-select-all">Select All</button>
          <button class="btn xs ghost" id="btn-select-none">Clear</button>
        </div>
      </div>
      <p class="muted small" style="margin:0.2rem 0 0.8rem;">Checked modules will be featured on your active roadmap and counted toward your certificate.</p>

      <div class="journey-modules-list">
        ${curriculum.map((w) => {
          const isChecked = activeWeeks.has(w.id);
          const totalMins = w.lessons.reduce((acc, l) => acc + (l.minutes || 15), 0);
          return `
            <label class="journey-module-item glass ${isChecked ? 'selected' : ''}" data-week="${w.id}">
              <input type="checkbox" class="module-chk" value="${w.id}" ${isChecked ? 'checked' : ''} />
              <div class="module-meta">
                <div class="module-title-row">
                  <span class="week-num" style="color:${w.color};">W${w.id}</span>
                  <b>${w.title}</b>
                  <span class="muted small">(${w.lessons.length} lessons · ~${totalMins}m)</span>
                </div>
                <div class="module-topics-row muted small">
                  ${(w.topics || w.lessons.map((l) => l.title)).slice(0, 4).join(' · ')}
                </div>
              </div>
            </label>
          `;
        }).join('')}
      </div>

      <!-- Progression Mode Options -->
      <h3 class="journey-subhead" style="margin-top:1.5rem;">3. Navigation & Prerequisite Mode</h3>
      <div class="journey-mode-selector glass" style="padding:1rem;">
        <label style="display:flex; gap:0.8rem; align-items:flex-start; cursor:pointer; margin-bottom:0.8rem;">
          <input type="radio" name="progression-mode" value="guided" ${!openAccess ? 'checked' : ''} style="margin-top:0.25rem;" />
          <div>
            <b>🛡️ Guided Prerequisites (Structured)</b>
            <p class="muted small" style="margin:0.2rem 0 0;">Lessons unlock sequentially as you complete previous modules in your journey.</p>
          </div>
        </label>
        <label style="display:flex; gap:0.8rem; align-items:flex-start; cursor:pointer;">
          <input type="radio" name="progression-mode" value="open" ${openAccess ? 'checked' : ''} style="margin-top:0.25rem;" />
          <div>
            <b>🔓 Free Roam Mode (Open Access)</b>
            <p class="muted small" style="margin:0.2rem 0 0;">Immediately unlock all lessons in your active journey. Great if you already have basic Python experience and want to jump straight to ML or Game Dev.</p>
          </div>
        </label>
      </div>

      <!-- Action Footer -->
      <div class="modal-actions" style="margin-top:1.6rem; display:flex; justify-content:space-between; align-items:center;">
        <div id="journey-summary-badge" class="muted small">
          Active: <b id="lbl-active-count">${activeWeeks.size}</b> / ${curriculum.length} modules
        </div>
        <div style="display:flex; gap:0.6rem;">
          <button class="btn ghost" id="btn-journey-cancel">Cancel</button>
          <button class="btn primary" id="btn-journey-apply">Apply Journey →</button>
        </div>
      </div>
    </div>
  `);

  const q = (sel) => m.el.querySelector(sel);
  const qa = (sel) => m.el.querySelectorAll(sel);

  const updateSummary = () => {
    q('#lbl-active-count').textContent = activeWeeks.size;
    qa('.journey-module-item').forEach((item) => {
      const wid = parseInt(item.dataset.week, 10);
      item.classList.toggle('selected', activeWeeks.has(wid));
    });
  };

  // Preset Selection
  qa('.journey-preset-card').forEach((card) => {
    card.onclick = () => {
      const tid = card.dataset.track;
      selectedTrack = tid;
      qa('.journey-preset-card').forEach((c) => c.classList.toggle('active', c.dataset.track === tid));

      const preset = TRACK_PRESETS.find((p) => p.id === tid);
      if (preset && preset.weeks.length > 0) {
        activeWeeks = new Set(preset.weeks);
        qa('.module-chk').forEach((chk) => {
          chk.checked = activeWeeks.has(parseInt(chk.value, 10));
        });
      }
      updateSummary();
    };
  });

  // Individual Module Checkbox Toggles
  qa('.module-chk').forEach((chk) => {
    chk.onchange = () => {
      const wid = parseInt(chk.value, 10);
      if (chk.checked) activeWeeks.add(wid);
      else activeWeeks.delete(wid);

      // If user customizes, switch active preset badge to custom
      selectedTrack = 'custom';
      qa('.journey-preset-card').forEach((c) => c.classList.toggle('active', c.dataset.track === 'custom'));
      updateSummary();
    };
  });

  // Select all / None
  q('#btn-select-all').onclick = () => {
    curriculum.forEach((w) => activeWeeks.add(w.id));
    qa('.module-chk').forEach((chk) => (chk.checked = true));
    selectedTrack = 'all';
    qa('.journey-preset-card').forEach((c) => c.classList.toggle('active', c.dataset.track === 'all'));
    updateSummary();
  };

  q('#btn-select-none').onclick = () => {
    activeWeeks.clear();
    qa('.module-chk').forEach((chk) => (chk.checked = false));
    selectedTrack = 'custom';
    qa('.journey-preset-card').forEach((c) => c.classList.toggle('active', c.dataset.track === 'custom'));
    updateSummary();
  };

  q('#btn-journey-cancel').onclick = () => m.close();

  // Apply Changes
  q('#btn-journey-apply').onclick = () => {
    if (activeWeeks.size === 0) {
      toast('Please select at least one module for your journey', 'warn');
      return;
    }

    const openModeSelected = q('input[name="progression-mode"]:checked').value === 'open';
    const sortedWeeks = Array.from(activeWeeks).sort((a, b) => a - b);

    store.setJourney({
      track: selectedTrack,
      activeWeeks: sortedWeeks,
      openAccess: openModeSelected,
    });

    toast(`🧭 Journey updated: ${sortedWeeks.length} modules active (${openModeSelected ? 'Free Roam' : 'Guided'})`, 'success');
    m.close();
    onApplied?.();
  };
}
