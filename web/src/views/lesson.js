// Lesson player: Learn → See → Predict → Code → Check.
import { findLesson, allLessons, isUnlocked } from '../content/curriculum.js';
import { store, BADGES } from '../engine/store.js';
import { runPython, runTests } from '../engine/pyRunner.js';
import { detectPitfalls, explainError } from '../engine/pitfalls.js';
import { createEditor } from '../ui/editor.js';
import { h, esc, md, toast, modal, celebrate, xpPop } from '../ui/dom.js';
import { setChatContext, openChat } from './chat.js';
import { openVisualizer } from './visualizer.js';
import { speakText, stopSpeaking, isSpeaking } from '../engine/voice.js';

const XP = { concept: 10, predictFirst: 25, predict: 10, challenge: 50, quiz: 40, lesson: 100 };
const TYPE_LABEL = { concept: 'learn', predict: 'predict', challenge: 'code', quiz: 'quiz' };

export function renderLesson(root, lessonId, stepParam) {
  const lesson = findLesson(lessonId);
  if (!lesson) return (location.hash = '#/roadmap');
  if (!isUnlocked(lessonId, store.get().lessons, store.getJourney())) {
    toast('🔒 Finish the previous lesson in your journey first', 'warn');
    return (location.hash = '#/roadmap');
  }

  // Resume at the first unfinished step
  let idx = stepParam != null ? Math.min(+stepParam, lesson.steps.length - 1) : Math.max(0, lesson.steps.findIndex((_, i) => !store.isStepDone(lesson.id, i)));
  if (idx < 0) idx = 0;

  const view = h(`
  <section class="lesson fade-in">
    <div class="pane learn-pane glass">
      <div class="lesson-head">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <a href="#/roadmap" class="back" id="btn-back">← Curriculum</a>
          <button class="btn xs ghost" id="btn-read-aloud" title="Read lesson text aloud (Voice TTS)">🔊 Listen</button>
        </div>
        <div class="lesson-title"><span>${lesson.emoji}</span> ${lesson.id} · ${esc(lesson.title)}</div>
        <div class="dots" id="dots"></div>
      </div>
      <div class="step-card" id="step-card"></div>
      <div class="lesson-foot">
        <button class="btn ghost" id="btn-prev">← Back</button>
        <span class="step-count" id="step-count"></span>
        <button class="btn primary" id="btn-next">Next →</button>
      </div>
    </div>

    <div class="pane code-pane glass">
      <div class="toolbar">
        <span class="file-tab">main.py</span>
        <div class="tool-btns">
          <button class="btn sm ghost" id="btn-reset" title="Reset code">reset</button>
          <button class="btn sm ghost" id="btn-visualize" title="Step-through Python execution visualizer">visualize 👁</button>
          <button class="btn sm ghost" id="btn-ai" title="Ask the AI Profesor to review your code">review</button>
          <button class="btn sm run" id="btn-run" title="Run code (Ctrl+Enter)">run ⌃↵</button>
          <button class="btn sm check" id="btn-check" title="Submit & Auto-Grade against hidden tests (Shift+Enter)">submit ⇧↵</button>
        </div>
      </div>
      <div class="editor-wrap" id="editor"></div>
      <div class="pitfalls" id="pitfalls"></div>
      <div class="io">
        <div class="io-in">
          <label for="stdin">stdin <small>— one line per input()</small></label>
          <textarea id="stdin" spellcheck="false" placeholder="Type what the user would enter…"></textarea>
        </div>
        <div class="io-out">
          <label>stdout</label>
          <pre id="console" class="console"><span class="muted">Run your code to see the output here.</span></pre>
        </div>
      </div>
      <div class="tests" id="tests"></div>
    </div>
  </section>`);
  root.replaceChildren(view);

  const q = (s) => view.querySelector(s);
  const stdinEl = q('#stdin');
  const consoleEl = q('#console');
  const testsEl = q('#tests');
  const pitfallsEl = q('#pitfalls');
  let lastOutput = '';
  let quizState = null;
  let pitfallTimer = null;

  const editor = createEditor(q('#editor'), {
    onRun: () => run(),
    onCheck: () => step().type === 'challenge' && check(),
    onChange: (code) => {
      const s = step();
      if (s.type === 'challenge' || s.type === 'concept') store.setDraft(draftKey(), code);
      clearTimeout(pitfallTimer);
      pitfallTimer = setTimeout(() => showPitfalls(code), 400);
      pushContext();
    },
  });

  const step = () => lesson.steps[idx];
  const draftKey = () => `${lesson.id}:${idx}`;

  function pushContext() {
    const s = step();
    setChatContext({
      lesson: `${lesson.id} ${lesson.title}`,
      step: `${TYPE_LABEL[s.type]} – ${s.title}`,
      task: s.type === 'challenge' ? s.body.replace(/<[^>]+>/g, '') : '',
      code: editor.get(),
      output: lastOutput,
    });
  }

  // ───────── rendering
  function renderDots() {
    q('#dots').innerHTML = lesson.steps
      .map((s, i) => `<button class="dot ${store.isStepDone(lesson.id, i) ? 'done' : ''} ${i === idx ? 'active' : ''}" data-i="${i}" title="${TYPE_LABEL[s.type]}: ${esc(s.title)}"></button>`)
      .join('');
    q('#dots').querySelectorAll('.dot').forEach((d) => {
      d.onclick = () => {
        const i = +d.dataset.i;
        if (i <= idx || store.isStepDone(lesson.id, i - 1)) go(i);
      };
    });
    q('#step-count').textContent = `${idx + 1} / ${lesson.steps.length}`;
    q('#btn-prev').disabled = idx === 0;
    const done = store.isStepDone(lesson.id, idx);
    const last = idx === lesson.steps.length - 1;
    const nextBtn = q('#btn-next');
    nextBtn.disabled = !done && step().type !== 'concept';
    nextBtn.textContent = last ? (store.isLessonDone(lesson.id) ? 'Finish ✓' : 'Complete lesson 🎉') : 'Next →';
    nextBtn.classList.toggle('pulse', done);
  }

  function renderStep() {
    const s = step();
    quizState = null;
    testsEl.innerHTML = '';
    consoleEl.innerHTML = '<span class="muted">Run your code to see the output here.</span>';
    lastOutput = '';
    const card = q('#step-card');
    card.classList.remove('slide-in');
    void card.offsetWidth;
    card.classList.add('slide-in');

    const typeTag = `<span class="type-tag t-${s.type}">${TYPE_LABEL[s.type]}</span>`;
    q('#btn-check').hidden = s.type !== 'challenge';
    q('#btn-reset').hidden = !(s.type === 'challenge' || s.type === 'concept');
    editor.setReadOnly(s.type === 'predict');

    if (s.type === 'concept') {
      card.innerHTML = `${typeTag}<h2>${s.title}</h2><div class="prose">${s.body}</div>
        ${s.code ? `<div class="try-it">👉 Press <b>▶ Run</b> to try it, then experiment!</div>` : ''}`;
      editor.set(store.getDraft(draftKey()) ?? s.code ?? '# Scratchpad — try anything!\n');
      stdinEl.value = s.stdin || '';
      if (!s.code) markDone(XP.concept);
    }

    if (s.type === 'predict') {
      const answered = store.isStepDone(lesson.id, idx);
      card.innerHTML = `${typeTag}<h2>${s.title}</h2><div class="prose"><p>${s.question}</p></div>
        <div class="options" id="options">${s.options.map((o, i) => `<button class="option" data-i="${i}"><span>${'ABCD'[i]}</span>${esc(o)}</button>`).join('')}</div>
        <div class="explain" id="explain" hidden></div>
        <div class="try-it">${answered ? '✔ Answered — press ▶ Run to verify.' : '🤔 Read the code on the right, then choose. (Run unlocks after you answer.)'}</div>`;
      editor.set(s.code);
      stdinEl.value = s.stdin || (s.code.includes('input(') ? '20' : '');
      q('#btn-run').disabled = !answered;
      let wrong = 0;
      card.querySelectorAll('.option').forEach((btn) => {
        btn.onclick = () => {
          if (card.querySelector('.option.correct')) return;
          const i = +btn.dataset.i;
          if (i === s.answer) {
            btn.classList.add('correct');
            const ex = q('#explain');
            ex.hidden = false;
            ex.innerHTML = `✅ <b>Correct!</b> ${s.explain}`;
            q('#btn-run').disabled = false;
            if (wrong === 0) {
              const streak = store.bump('predictStreak');
              if (streak >= 3) earn('sharp_eye');
            } else store.get().predictStreak = 0;
            markDone(wrong === 0 ? XP.predictFirst : XP.predict, btn);
          } else {
            wrong++;
            btn.classList.add('wrong');
            btn.disabled = true;
            const ex = q('#explain');
            ex.hidden = false;
            ex.innerHTML = `❌ Not quite — think again. ${wrong >= 2 ? `<br><small>Hint: ${s.explain.split('.')[0]}.</small>` : ''}`;
          }
        };
      });
      if (answered) card.querySelector(`.option[data-i="${s.answer}"]`).classList.add('correct');
    } else {
      q('#btn-run').disabled = false;
    }

    if (s.type === 'challenge') {
      const key = draftKey();
      const fails = store.attempts(key);
      card.innerHTML = `${typeTag}<h2>${s.title}</h2><div class="prose">${s.body}</div>
        <div class="hint-box">
          <div class="hint-row">
            <button class="btn sm ghost" id="btn-hint">💡 Hint <span id="hint-lv"></span></button>
            <button class="btn sm ghost" id="btn-solution" ${fails >= 3 || store.isStepDone(lesson.id, idx) ? '' : 'disabled'} title="Unlocks after 3 failed checks">🔑 Solution</button>
          </div>
          <div id="hints"></div>
        </div>
        <div class="try-it">Press <b>▶ Run</b> to test with your own input, <b>✓ Check</b> to run the ${s.tests.length} hidden tests.</div>`;
      editor.set(store.getDraft(key) ?? s.starter);
      stdinEl.value = s.stdin || '';
      let shown = 0;
      const hintsEl = q('#hints');
      const lv = q('#hint-lv');
      lv.textContent = `(0/${s.hints.length})`;
      q('#btn-hint').onclick = () => {
        if (shown >= s.hints.length) return;
        hintsEl.append(h(`<div class="hint slide-in"><b>Hint ${shown + 1}:</b> ${s.hints[shown]}</div>`));
        shown++;
        lv.textContent = `(${shown}/${s.hints.length})`;
      };
      q('#btn-solution').onclick = () => {
        const m = modal(`<h2>🔑 Reference solution</h2><p class="muted">Try to understand each line — then type it yourself instead of pasting.</p><pre class="md-code"><code>${esc(s.solution)}</code></pre>
          <div class="modal-actions"><button class="btn ghost" id="sol-close">Close</button><button class="btn primary" id="sol-load">Load into editor</button></div>`);
        m.el.querySelector('#sol-close').onclick = m.close;
        m.el.querySelector('#sol-load').onclick = () => {
          editor.set(s.solution);
          m.close();
        };
      };
      if (store.isStepDone(lesson.id, idx)) testsEl.innerHTML = `<div class="tests-summary pass">✅ You already passed this challenge.</div>`;
    }

    if (s.type === 'quiz') renderQuiz(card, typeTag);

    showPitfalls(editor.get());
    renderDots();
    pushContext();
  }

  function renderQuiz(card, typeTag) {
    const s = step();
    quizState ||= { i: 0, score: 0, answered: false };
    const { i } = quizState;
    if (i >= s.questions.length) {
      const pass = quizState.score >= s.passScore;
      card.innerHTML = `${typeTag}<h2>${s.title}</h2>
        <div class="quiz-result ${pass ? 'pass' : 'fail'}">
          <div class="big-score">${quizState.score}/${s.questions.length}</div>
          <p>${pass ? '🎉 Passed! Great logic skills.' : `You need ${s.passScore}/${s.questions.length} to pass. Review and try again!`}</p>
          ${pass ? '' : '<button class="btn primary" id="btn-retry">↺ Retry quiz</button>'}
        </div>`;
      if (pass) {
        if (quizState.score === s.questions.length) earn('quiz_ace');
        markDone(XP.quiz, card.querySelector('.big-score'));
        celebrate();
      } else card.querySelector('#btn-retry').onclick = () => { quizState = { i: 0, score: 0 }; renderQuiz(card, typeTag); };
      return;
    }
    const qn = s.questions[i];
    card.innerHTML = `${typeTag}<h2>${s.title}</h2>
      <div class="quiz-progress"><i style="width:${(i / s.questions.length) * 100}%"></i></div>
      <p class="quiz-q"><span>Q${i + 1}.</span> ${qn.q}</p>
      ${qn.code ? `<pre class="md-code"><code>${esc(qn.code)}</code></pre>` : ''}
      <div class="options">${qn.options.map((o, k) => `<button class="option" data-k="${k}"><span>${'ABCD'[k]}</span>${esc(o)}</button>`).join('')}</div>
      <div class="explain" id="explain" hidden></div>
      <div class="quiz-nav"><span class="muted">Score: ${quizState.score}</span><button class="btn primary" id="btn-qnext" hidden>${i === s.questions.length - 1 ? 'See result' : 'Next question →'}</button></div>`;
    card.querySelectorAll('.option').forEach((btn) => {
      btn.onclick = () => {
        if (quizState.answered) return;
        quizState.answered = true;
        const k = +btn.dataset.k;
        const right = k === qn.answer;
        if (right) quizState.score++;
        btn.classList.add(right ? 'correct' : 'wrong');
        card.querySelector(`.option[data-k="${qn.answer}"]`).classList.add('correct');
        const ex = card.querySelector('#explain');
        ex.hidden = false;
        ex.innerHTML = `${right ? '✅ <b>Correct!</b>' : '❌ <b>Not quite.</b>'} ${qn.explain}`;
        card.querySelector('#btn-qnext').hidden = false;
      };
    });
    card.querySelector('#btn-qnext').onclick = () => {
      quizState.i++;
      quizState.answered = false;
      renderQuiz(card, typeTag);
    };
  }

  function showPitfalls(code) {
    const warnings = step().type === 'predict' || step().type === 'quiz' ? [] : detectPitfalls(code);
    pitfallsEl.innerHTML = warnings
      .slice(0, 3)
      .map((w) => `<button class="pitfall" data-line="${w.line}"><b>⚠ ${md(w.title)}${w.line ? ` <small>line ${w.line}</small>` : ''}</b><span>${md(w.text)}</span></button>`)
      .join('');
    pitfallsEl.querySelectorAll('.pitfall').forEach((b) => (b.onclick = () => editor.goToLine(+b.dataset.line)));
  }

  // ───────── actions
  function markDone(xp, anchor) {
    if (store.completeStep(lesson.id, idx)) {
      store.addXp(xp);
      xpPop(xp, anchor || q('#btn-next'));
    }
    renderDots();
  }

  function earn(id) {
    if (store.award(id)) {
      const b = BADGES[id];
      toast(`<span class="toast-badge">${b.icon}</span> <b>Badge unlocked:</b> ${b.name}`, 'badge', 4200);
    }
  }

  function showResult(r) {
    lastOutput = r.stdout || '';
    let html = r.stdout ? esc(r.stdout) : '<span class="muted">(no output)</span>';
    if (!r.ok) {
      const help = explainError(r.errorType, r.errorMsg);
      html += `<div class="err-box"><b>🧑‍🏫 ${esc(r.errorType)}${r.errorLine ? ` on line ${r.errorLine}` : ''}</b>
        ${help ? `<p>${md(help)}</p>` : ''}
        <div class="err-actions">${r.errorLine ? `<button class="btn xs ghost" data-goto="${r.errorLine}">Go to line ${r.errorLine}</button>` : ''}<button class="btn xs ghost" data-ask>🤖 Ask the Profesor</button></div></div>`;
    }
    consoleEl.innerHTML = html;
    consoleEl.querySelector('[data-goto]')?.addEventListener('click', (e) => editor.goToLine(+e.target.dataset.goto));
    consoleEl.querySelector('[data-ask]')?.addEventListener('click', () => {
      pushContext();
      openChat(`I got a ${r.errorType}: "${r.errorMsg}". Can you help me understand it without giving me the full answer?`);
    });
    pushContext();
  }

  async function run() {
    const btn = q('#btn-run');
    if (btn.disabled) return;
    btn.classList.add('loading');
    consoleEl.innerHTML = '<span class="muted">Running…</span>';
    const r = await runPython(editor.get(), stdinEl.value);
    btn.classList.remove('loading');
    showResult(r);
    earn('first_run');
    if (step().type === 'concept' && r.ok) markDone(XP.concept, btn);
  }

  async function check() {
    const s = step();
    const btn = q('#btn-check');
    btn.classList.add('loading');
    testsEl.innerHTML = `<div class="tests-summary">Running ${s.tests.length} tests…</div>`;
    const results = await runTests(editor.get(), s.tests);
    btn.classList.remove('loading');
    const passed = results.filter((r) => r.passed).length;
    const all = passed === results.length;
    testsEl.innerHTML = `
      <div class="tests-summary ${all ? 'pass' : 'fail'}">${all ? '🎉 All tests passed!' : `${passed}/${results.length} tests passed`}</div>
      <ul class="test-list">${results.map((r) => `<li class="${r.passed ? 'ok' : 'ko'}"><span>${r.passed ? '✔' : '✘'}</span><b>${esc(r.name)}</b>${r.passed ? '' : `<small>${esc(r.message)}</small>`}</li>`).join('')}</ul>`;
    const firstFail = results.find((r) => !r.passed);
    if (firstFail) showResult(firstFail.result);
    if (all) {
      const hadFails = store.attempts(draftKey()) > 0;
      const spree = store.recordSubmitSuccess(hadFails);
      markDone(XP.challenge, btn);
      earn('first_challenge');
      if (hadFails) earn('bug_slayer');
      if (spree === 3) {
        earn('sharpshooter_3');
        store.addXp(50);
        toast('🎯 <b>Sharpshooter III: 3 clean submissions in a row!</b> +50 XP bonus', 'badge', 4500);
      } else if (spree === 5) {
        earn('sharpshooter_5');
        store.addXp(100);
        toast('⚡ <b>Master Marksman: 5 clean submissions!</b> +100 XP bonus', 'badge', 4500);
      } else if (spree === 10) {
        earn('sharpshooter_10');
        store.addXp(250);
        toast('🏹 <b>Archmage Marksman: 10 clean submissions!</b> +250 XP bonus', 'badge', 5000);
      }
      celebrate();
    } else {
      store.resetSpree();
      const n = store.failAttempt(draftKey());
      if (n >= 3) q('#btn-solution')?.removeAttribute('disabled');
      if (n === 2) toast('💡 Stuck? Try the <b>Hint</b> button or <b>🤖 Review</b>.', 'info');
    }
  }

  function go(i) {
    stopSpeaking();
    idx = i;
    history.replaceState(null, '', `#/lesson/${lesson.id}/${idx}`);
    renderStep();
  }

  function finishLesson() {
    stopSpeaking();
    const first = store.completeLesson(lesson.id);
    if (first) {
      store.addXp(XP.lesson);
      store.addChest(1); // Reward mystery loot chest upon completing lesson
    }
    const pos = allLessons.findIndex((l) => l.id === lesson.id);
    const nextL = allLessons[pos + 1];
    if (first && !nextL) earn('week1');
    celebrate(true);
    const m = modal(`<div class="done-modal"><div class="done-emoji">🎉</div><h2>Lesson complete!</h2>
      <p>${lesson.emoji} <b>${lesson.title}</b> ${first ? `— <span class="grad">+${XP.lesson} XP · +1 🎁 Chest</span>` : ''}</p>
      <p class="muted">Your progress is saved. Export the tracker anytime from the roadmap.</p>
      <div class="modal-actions"><a class="btn ghost" href="#/roadmap" id="m-home">Curriculum</a>
      ${nextL ? `<a class="btn primary" href="#/lesson/${nextL.id}" id="m-next">Next: ${nextL.emoji} ${nextL.title} →</a>` : '<span class="btn primary">🎓 Week 1 done — Week 2 coming next!</span>'}</div></div>`);
    m.el.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => m.close()));
  }

  // ───────── wiring
  q('#btn-run').onclick = run;
  q('#btn-check').onclick = check;
  q('#btn-visualize').onclick = () => {
    openVisualizer({ code: editor.get(), stdin: stdinEl.value, editor });
  };
  const readBtn = q('#btn-read-aloud');
  if (readBtn) {
    readBtn.onclick = () => {
      if (isSpeaking()) {
        stopSpeaking();
        readBtn.textContent = '🔊 Listen';
        readBtn.classList.remove('pulse');
      } else {
        const s = step();
        const textToRead = `${s.title}. ${s.body || s.question || ''}`;
        speakText(textToRead, {
          onStart: () => {
            readBtn.textContent = '⏹ Stop';
            readBtn.classList.add('pulse');
          },
          onEnd: () => {
            readBtn.textContent = '🔊 Listen';
            readBtn.classList.remove('pulse');
          },
          onError: () => {
            readBtn.textContent = '🔊 Listen';
            readBtn.classList.remove('pulse');
          },
        });
      }
    };
  }
  q('#btn-prev').onclick = () => idx > 0 && go(idx - 1);
  q('#btn-next').onclick = () => {
    if (step().type === 'concept') markDone(XP.concept);
    if (!store.isStepDone(lesson.id, idx)) return;
    if (idx < lesson.steps.length - 1) go(idx + 1);
    else finishLesson();
  };
  q('#btn-reset').onclick = () => {
    const s = step();
    editor.set(s.type === 'challenge' ? s.starter : s.code || '');
    store.setDraft(draftKey(), editor.get());
  };
  q('#btn-ai').onclick = () => {
    pushContext();
    openChat('Please review my code for this step.');
  };

  const keyNav = (e) => {
    if (e.target.closest('.cm-editor, textarea, input')) return;
    if (e.key === 'ArrowRight') q('#btn-next').click();
    if (e.key === 'ArrowLeft') q('#btn-prev').click();
  };
  document.addEventListener('keydown', keyNav);
  window.addEventListener('hashchange', () => {
    stopSpeaking();
    document.removeEventListener('keydown', keyNav);
  }, { once: true });

  renderStep();
}
