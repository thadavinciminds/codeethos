// Pro Subscription & Community Modal (Phase 3)
// Transparent, fair pricing inspired by Boot.dev benchmarks ($19/mo or $149/yr with PPP discounts).
import { modal, toast } from '../ui/dom.js';

export function openProModal() {
  const m = modal(`
    <div class="pro-modal-wrap" style="padding:1rem;">
      <div style="text-align:center; margin-bottom:1.8rem;">
        <span class="pill" style="font-size:0.75rem;">// ACCELERATE YOUR CAREER</span>
        <h2 style="font-size:1.8rem; font-weight:600; margin:0.4rem 0 0.4rem;">
          Codeethos <span class="grad">Pro</span>
        </h2>
        <p class="muted small" style="max-width:480px; margin:0 auto;">
          The full developer mastery experience. Zero video fluff, test-driven challenges, and unlimited local Socratic AI guidance.
        </p>
      </div>

      <!-- Pricing Plans Comparison -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1.2rem; margin-bottom:2rem;">
        <!-- Free Community Tier -->
        <div class="glass" style="padding:1.4rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="font-size:0.8rem; color:var(--muted); text-transform:uppercase;">Community Tier</div>
            <div style="font-size:1.8rem; font-weight:600; margin:0.4rem 0 0.8rem;">$0 <small style="font-size:0.5em; color:var(--muted)">Free Forever</small></div>
            <ul style="list-style:none; padding:0; margin:0; font-size:0.84rem; display:grid; gap:0.6rem; color:var(--muted);">
              <li>✓ All 8 Python core modules</li>
              <li>✓ In-browser WebAssembly execution</li>
              <li>✓ 10 daily Socratic AI hearts</li>
              <li>✓ Sharpshooter sprees & loot chests</li>
              <li>✓ Community Discord access</li>
            </ul>
          </div>
          <button class="btn ghost sm" style="margin-top:1.5rem; width:100%;" disabled>Current Plan</button>
        </div>

        <!-- Pro Tier -->
        <div class="glass" style="padding:1.4rem; border:1px solid var(--accent); background:rgba(212, 166, 90, 0.05); display:flex; flex-direction:column; justify-content:space-between; position:relative;">
          <div style="position:absolute; top:-10px; right:12px; background:var(--accent); color:var(--bg); font-size:0.7rem; font-weight:600; padding:0.15rem 0.6rem; border-radius:var(--radius);">
            RECOMMENDED
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--accent); text-transform:uppercase; font-weight:500;">Pro Engineer</div>
            <div style="font-size:1.8rem; font-weight:600; margin:0.4rem 0 0.8rem; color:var(--text);">
              $19 <small style="font-size:0.5em; color:var(--muted)">/ month or $149/yr</small>
            </div>
            <ul style="list-style:none; padding:0; margin:0; font-size:0.84rem; display:grid; gap:0.6rem;">
              <li><strong style="color:var(--green)">✓ Unlimited Socratic AI tutor queries</strong></li>
              <li><strong style="color:var(--text)">✓ Voice Q&A & TTS read-aloud lessons</strong></li>
              <li><strong style="color:var(--text)">✓ Verified digital completion certificates</strong></li>
              <li><strong style="color:var(--text)">✓ Early access: Go, Rust & SQL tracks</strong></li>
              <li><strong style="color:var(--text)">✓ Private Discord Pro Guild channel</strong></li>
            </ul>
          </div>
          <button class="btn primary sm cta-glow" id="btn-upgrade-pro" style="margin-top:1.5rem; width:100%;">
            ⚡ Upgrade to Pro (7-Day Trial)
          </button>
        </div>
      </div>

      <!-- Discord & Guarantee Banner -->
      <div class="glass" style="padding:1rem 1.2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem;">
        <div style="display:flex; align-items:center; gap:0.8rem;">
          <span style="font-size:1.6rem;">💬</span>
          <div>
            <b style="font-size:0.9rem;">Join the Codeethos Discord</b>
            <div class="muted small">Discuss exercises, share projects, and collaborate with peer developers.</div>
          </div>
        </div>
        <a href="https://discord.gg/codeethos" target="_blank" rel="noopener" class="btn ghost sm">
          Join Discord ↗
        </a>
      </div>

      <div class="modal-actions" style="margin-top:1.4rem;">
        <button class="btn ghost sm" id="btn-pro-close">Close</button>
      </div>
    </div>
  `);

  m.el.querySelector('#btn-pro-close').onclick = m.close;
  m.el.querySelector('#btn-upgrade-pro').onclick = () => {
    toast('🎉 Thank you for supporting Codeethos! Pro features unlocked for your session.', 'badge', 5000);
    m.close();
  };
}
