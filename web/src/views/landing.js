// Landing view: High-converting, developer-native landing page for cold visitors.
import { curriculum, TRACK_PRESETS } from '../content/curriculum.js';
import { store } from '../engine/store.js';
import { runPython, initPython } from '../engine/pyRunner.js';
import { esc } from '../ui/dom.js';

export function renderLanding(root) {
  const s = store.get();
  const hasProgress = (s.lessons && s.lessons.length > 0);
  const nextLessonId = hasProgress ? s.lessons[s.lessons.length - 1] : '1.1';

  const view = document.createElement('div');
  view.className = 'landing fade-in';
  view.innerHTML = `
    <!-- Hero Section -->
    <section class="landing-hero">
      <div class="landing-hero-badge">
        <span class="badge-dot"></span>
        <span>Interactive In-Browser Learning Platform</span>
      </div>
      
      <h1 class="landing-title">
        Master programming by <span class="landing-highlight">building & breaking</span> code.
      </h1>

      <p class="landing-subtitle">
        Zero video lectures. Zero local setup hassles. Code directly in your browser with real-time test-driven grading, instant execution, and an intelligent Socratic AI mentor.
      </p>

      <div class="landing-cta-group">
        <a href="#/lesson/1.1" class="btn primary big cta-glow" id="btn-hero-start">
          <span>⚡ Start Lesson 1.1 — Free</span>
        </a>
        <a href="#/roadmap" class="btn ghost big" id="btn-hero-curriculum">
          <span>Explore Curriculum →</span>
        </a>
        ${hasProgress ? `
          <a href="#/lesson/${nextLessonId}" class="btn sm pulse" style="margin-top:0.4rem;">
            <span>Resume where you left off (Lesson ${nextLessonId})</span>
          </a>
        ` : ''}
      </div>

      <div class="landing-trust-strip">
        <div class="trust-item"><span class="trust-icon">✓</span> 100% In-Browser WASM</div>
        <div class="trust-item"><span class="trust-icon">✓</span> Unit-Test Auto-Graded</div>
        <div class="trust-item"><span class="trust-icon">✓</span> Socratic AI Guidance</div>
        <div class="trust-item"><span class="trust-icon">✓</span> No Credit Card Required</div>
      </div>
    </section>

    <!-- Interactive Live Sandbox Showcase -->
    <section class="landing-preview-section glass">
      <div class="preview-header">
        <div class="window-dots">
          <span class="dot-red"></span>
          <span class="dot-yellow"></span>
          <span class="dot-green"></span>
        </div>
        <span class="preview-filename">demo.py — Try It Live Now</span>
        <button class="btn sm run" id="btn-demo-run">▶ Run Code</button>
      </div>

      <div class="preview-body">
        <div class="preview-code-wrap">
          <pre class="preview-code"><code id="demo-code-text"><span class="syn-def">def</span> <span class="syn-func">fibonacci_stream</span>(limit):
    <span class="syn-str">"""Generate a Fibonacci sequence in WebAssembly Python."""</span>
    a, b = <span class="syn-num">0</span>, <span class="syn-num">1</span>
    sequence = []
    <span class="syn-kw">while</span> len(sequence) < limit:
        sequence.append(a)
        a, b = b, a + b
    <span class="syn-kw">return</span> sequence

numbers = fibonacci_stream(<span class="syn-num">8</span>)
print(<span class="syn-str">f"✨ Computed {len(numbers)} numbers: {numbers}"</span>)
print(<span class="syn-str">"⚡ Execution in your browser via Pyodide WASM!"</span>)</code></pre>
        </div>
        <div class="preview-console">
          <div class="console-label">TERMINAL STDOUT</div>
          <pre id="demo-console-out" class="demo-console-text"><span class="dim">Click [▶ Run Code] above to execute in WebAssembly...</span></pre>
        </div>
      </div>
    </section>

    <!-- Core Pillars / How it works -->
    <section class="landing-features">
      <div class="section-badge">// THE CODEETHOS PEDAGOGY</div>
      <h2 class="landing-section-title">Why Developers Learn 3x Faster Here</h2>
      <p class="landing-section-sub">Bootcamp concepts engineered into tight feedback loops inspired by top CS programs.</p>

      <div class="feature-grid">
        <div class="feature-card glass">
          <div class="feature-icon">⚡</div>
          <h3>Client-Side WASM Engine</h3>
          <p>Instant code execution powered by Pyodide in dedicated Web Workers. No waiting in backend queues, no container cold-starts, and 100% private execution on your hardware.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-icon">🧪</div>
          <h3>Test-Driven Auto-Grading</h3>
          <p>Every exercise is scored against comprehensive unit test suites. Clear visual diffs highlight exact inputs and expected outputs so you debug like an engineer.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-icon">🦉</div>
          <h3>Socratic AI Mentor</h3>
          <p>Integrated AI tutor pre-loaded with lesson context and common pitfalls. It guides your thinking with Socratic questions rather than spoiling the answer.</p>
        </div>

        <div class="feature-card glass">
          <div class="feature-icon">🎮</div>
          <h3>RPG Mastery & Streaks</h3>
          <p>Earn XP, level up, maintain daily streaks with freezes, and earn badges across 8 modular weeks ranging from syntax to Scikit-Learn pipelines and 2D arcade games.</p>
        </div>
      </div>
    </section>

    <!-- Curriculum Tracks Preview -->
    <section class="landing-curriculum">
      <div class="section-badge">// CURRICULUM PATHWAYS</div>
      <h2 class="landing-section-title">Structured Learning Paths</h2>
      <p class="landing-section-sub">Choose your target outcome or master the entire full-stack Python curriculum.</p>

      <div class="tracks-grid">
        ${TRACK_PRESETS.filter(t => t.id !== 'custom').map(track => `
          <div class="track-card glass">
            <div class="track-card-header">
              <span class="track-icon">${track.icon}</span>
              <div>
                <h3 class="track-name">${esc(track.name)}</h3>
                <span class="track-tagline">${esc(track.tagline)}</span>
              </div>
            </div>
            <p class="track-desc">${esc(track.desc)}</p>
            <div class="track-meta">
              <span class="track-weeks">${track.weeks.length} Key Modules</span>
              <a href="#/roadmap" class="track-link">View Track →</a>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 8-Week Module Overview Grid -->
      <div class="modules-overview">
        <h3 class="modules-subhead">Included Core Modules:</h3>
        <div class="module-chips">
          ${curriculum.map(m => `
            <a href="#/roadmap" class="module-chip glass" title="${esc(m.title)}">
              <span class="m-emoji">${m.emoji}</span>
              <span class="m-id">W${m.id}</span>
              <span class="m-title">${esc(m.title)}</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Platform Benchmark Comparison -->
    <section class="landing-comparison">
      <div class="section-badge">// BENCHMARK</div>
      <h2 class="landing-section-title">How Codeethos Compares</h2>
      <div class="comparison-table-wrap glass">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th class="brand-col">Codeethos</th>
              <th>Video Courses</th>
              <th>LeetCode</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Learning Format</td>
              <td class="brand-col"><strong>Interactive Code-First</strong></td>
              <td>Passive Video Watching</td>
              <td>Competitive Puzzles</td>
            </tr>
            <tr>
              <td>Execution Speed</td>
              <td class="brand-col"><strong>Instant (< 50ms WASM)</strong></td>
              <td>None / Local</td>
              <td>Server Queues</td>
            </tr>
            <tr>
              <td>AI Tutor Support</td>
              <td class="brand-col"><strong>Socratic (No Leaks)</strong></td>
              <td>None</td>
              <td>Paid Generic LLM</td>
            </tr>
            <tr>
              <td>Project-Based Capstones</td>
              <td class="brand-col"><strong>Yes (Arcade, ML, CLI)</strong></td>
              <td>Code-along clone</td>
              <td>Algorithm Snippets Only</td>
            </tr>
            <tr>
              <td>Cost</td>
              <td class="brand-col"><strong>Free Core Interactive</strong></td>
              <td>$20–$50/mo or $200+</td>
              <td>$35/mo Premium</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Bottom CTA Bar -->
    <section class="landing-bottom-cta glass">
      <div class="bottom-cta-inner">
        <h2>Ready to write real code?</h2>
        <p>No downloads, no credit card, no fluff. Jump straight into Lesson 1.1 right now.</p>
        <div class="cta-btns">
          <a href="#/lesson/1.1" class="btn primary big cta-glow">Start Coding Free →</a>
          <a href="#/roadmap" class="btn ghost big">Browse All Lessons</a>
        </div>
      </div>
    </section>
  `;

  root.replaceChildren(view);

  // Live sandbox demo runner logic
  const runBtn = view.querySelector('#btn-demo-run');
  const consoleOut = view.querySelector('#demo-console-out');

  const samplePython = `def fibonacci_stream(limit):
    """Generate a Fibonacci sequence in WebAssembly Python."""
    a, b = 0, 1
    sequence = []
    while len(sequence) < limit:
        sequence.append(a)
        a, b = b, a + b
    return sequence

numbers = fibonacci_stream(8)
print(f"✨ Computed {len(numbers)} numbers: {numbers}")
print("⚡ Execution in your browser via Pyodide WASM!")
`;

  runBtn.onclick = async () => {
    runBtn.disabled = true;
    runBtn.textContent = 'Running...';
    consoleOut.innerHTML = '<span class="dim">Initializing WebAssembly Python engine...</span>';
    try {
      await initPython();
      const res = await runPython(samplePython);
      if (res.ok) {
        consoleOut.textContent = res.stdout || 'Program exited cleanly with 0 output.';
      } else {
        consoleOut.textContent = `${res.errorType}: ${res.errorMsg}`;
      }
    } catch (err) {
      consoleOut.textContent = `Error: ${err.message || 'Execution failed'}`;
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = '▶ Run Code';
    }
  };
}
