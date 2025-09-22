// /src/js/tgk-quiz-engine.js  (progressive-reveal build)
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls) => { const n = document.createElement(tag); if (cls) n.className = cls; return n; };

  class TGKQuiz {
    constructor(opts) {
      this.rootSel = opts.containerSelector || '#quiz-container';
      this.root = $(this.rootSel);
      if (!this.root) throw new Error(`[TGKQuiz] container ${this.rootSel} not found`);
      this.quizId = this.root.getAttribute('data-quiz-id') || '';
      if (!this.quizId) throw new Error('[TGKQuiz] data-quiz-id missing');

      const dataScript = document.getElementById('quiz-data');
      this.data = opts.data || (dataScript ? JSON.parse(dataScript.textContent) : null);
      if (!this.data) throw new Error('[TGKQuiz] no quiz data found');

      this.ui = Object.assign({
        oneAtATime: true,
        autoadvanceOnAnswer: true,
        showCorrectReveal: false,   // no per-question feedback
        showFinalSummary: true,
        allowRetry: true,
        labels: {
          start: 'Start Quiz', next: 'Next', finish: 'See Results', retry: 'Try Again',
          correct: 'Correct', incorrect: 'Incorrect', yourAnswer: 'Your answer',
          correctAnswer: 'Correct answer', explanation: 'Why this is the answer',
          scoreTitle: 'Your score'
        },
        classes: {
          card: 'quiz-card',
          prompt: 'quiz-prompt',
          optionBtn: 'quiz-button',
          correct: 'quiz-correct',
          wrong: 'quiz-wrong',
          feedback: 'quiz-feedback',
          progress: 'quiz-progress',
          summary: 'quiz-summary',
        }
      }, opts.ui || {});

      // attempt starts at 1; after each reset it increments
      this.state = { i: -1, answers: [], correct: 0, review: [], attempt: 1, startedAt: performance.now() };
      this.mount();
    }

    mount() {
      this.root.innerHTML = '';
      const card = el('div', this.ui.classes.card);
      if (this.data.intro) {
        const p = el('p', this.ui.classes.prompt);
        p.textContent = this.data.intro;
        card.appendChild(p);
      }
      const startBtn = el('button', this.ui.classes.optionBtn);
      startBtn.textContent = this.ui.labels.start;
      startBtn.addEventListener('click', () => this.next());
      const prog = el('div', this.ui.classes.progress);
      prog.setAttribute('aria-live', 'polite');
      this.root.append(card, prog);
      this.$card = card; this.$prog = prog;
    }

    renderQ() {
      const q = this.data.questions[this.state.i];
      this.$card.innerHTML = '';
      const prompt = el('div', this.ui.classes.prompt);
      const idx = this.state.i + 1;
      prompt.textContent = `${idx}. ${q.prompt}`;
      const optsWrap = el('div');
      q.options.forEach(opt => {
        const b = el('button', this.ui.classes.optionBtn);
        b.type = 'button'; b.dataset.key = opt.key;
        b.textContent = `${opt.key}. ${opt.label}`;
        b.addEventListener('click', () => this.answer(q, opt, b));
        optsWrap.appendChild(b);
      });
      this.$card.append(prompt, optsWrap);
      const total = this.data.questions.length;
      const i = Math.max(0, this.state.i);
      this.$prog.textContent = `Question ${i + 1} of ${total}`;
    }

    answer(q, opt, btnEl) {
      const correct = opt.key === q.answer;
      this.state.answers.push({ id: q.id, chosen: opt.key, correct });
      if (correct) this.state.correct += 1;

      // Collect review for possible later reveal
      const correctOpt = q.options.find(o => o.key === q.answer);
      this.state.review.push({
        id: q.id,
        prompt: q.prompt,
        chosenKey: opt.key,
        chosenLabel: opt.label,
        correctKey: q.answer,
        correctLabel: correctOpt ? correctOpt.label : '',
        explanation: q.explanation || '',
        correct
      });

      // Visual mark on buttons only
      const allBtns = this.$card.querySelectorAll("." + this.ui.classes.optionBtn);
      allBtns.forEach(b => b.disabled = true);
      if (btnEl) {
        if (correct) {
          btnEl.classList.add(this.ui.classes.correct);
        } else {
          btnEl.classList.add(this.ui.classes.wrong);
          const cBtn = [...allBtns].find(b => b.dataset.key === q.answer);
          if (cBtn) cBtn.classList.add(this.ui.classes.correct);
        }
      }

      const isLast = this.state.i >= this.data.questions.length - 1;
      if (this.ui.autoadvanceOnAnswer) {
        setTimeout(() => (isLast ? this.finish() : this.next()), 450);
      } else {
        const btn = el('button', this.ui.classes.optionBtn);
        btn.textContent = isLast ? this.ui.labels.finish : this.ui.labels.next;
        btn.addEventListener('click', () => (isLast ? this.finish() : this.next()));
        this.$card.appendChild(btn);
      }
    }

    next() {
      this.state.i += 1;
      if (this.state.i < this.data.questions.length) this.renderQ();
      else this.finish();
    }

    finish() {
      const total = this.data.questions.length;
      const durationMs = Math.max(0, Math.round(performance.now() - this.state.startedAt));
      const meta = this.data.meta || window.__QUIZ_META__ || {};
      const { seriesId, episodeId, partId, quizId, storageKeyRoot } = meta;

      if (window.TGKProgress && seriesId && episodeId && partId) {
        window.TGKProgress.recordAttempt({
          root: storageKeyRoot || 'tgkProgress',
          seriesId, episodeId, partId, quizId,
          totalQuestions: total,
          correctCount: this.state.correct,
          durationMs
        });
      }

      // Summary
      this.$card.innerHTML = '';
      const s = el('div', this.ui.classes.summary);
      const pct = total ? Math.round((this.state.correct / total) * 100) : 0;

      const h = document.createElement('h3');
      h.textContent = this.ui.labels.scoreTitle;
      const p = document.createElement('p');
      p.innerHTML = `<strong>${this.state.correct}/${total}</strong> (${pct}%)`;

      s.append(h, p);

      // Progressive reveal: only show review on attempt >= 2
      if (this.state.attempt >= 2) {
        const reviewTitle = document.createElement('h4');
        reviewTitle.textContent = 'Review';

        const list = document.createElement('ol');
        list.className = 'quiz-review';

        this.state.review.forEach((r, idx) => {
          const li = document.createElement('li');
          li.className = 'quiz-review-item';

          const qp = document.createElement('p');
          qp.className = this.ui.classes.prompt;
          qp.textContent = `${idx + 1}. ${r.prompt}`;

          const badge = document.createElement('p');
          badge.className = r.correct ? this.ui.classes.correct : this.ui.classes.wrong;
          badge.textContent = r.correct ? this.ui.labels.correct : this.ui.labels.incorrect;

          const ya = document.createElement('p');
          ya.innerHTML = `<em>${this.ui.labels.yourAnswer}:</em> ${r.chosenKey}. ${r.chosenLabel}`;
          li.append(qp, badge, ya);

          if (!r.correct) {
            const ca = document.createElement('p');
            ca.innerHTML = `<em>${this.ui.labels.correctAnswer}:</em> ${r.correctKey}. ${r.correctLabel}`;
            li.appendChild(ca);
          }

          if (r.explanation) {
            const ex = document.createElement('p');
            ex.className = this.ui.classes.feedback + ' show';
            ex.innerHTML = `<em>${this.ui.labels.explanation}:</em> ${r.explanation}`;
            li.appendChild(ex);
          }

          list.appendChild(li);
        });

        s.append(reviewTitle, list);
      }

      if (this.ui.allowRetry) {
        const r = el('button', this.ui.classes.optionBtn);
        r.textContent = this.ui.labels.retry;
        r.addEventListener('click', () => this.reset());
        s.appendChild(r);
      }

      this.$card.appendChild(s);
    }

    reset() {
      // increment attempt count; clear answers/review; restart at Q1
      this.state = {
        i: -1,
        answers: [],
        correct: 0,
        review: [],
        attempt: (this.state.attempt || 1) + 1,
        startedAt: performance.now()
      };
      this.mount();
      this.next();
    }
  }

  // Expose the class regardless of auto-boot
  window.TGKQuiz = TGKQuiz;

  // Auto-boot is the only part that honors the flag
  window.addEventListener('DOMContentLoaded', () => {
    if (window.__TGK_NO_AUTOBOOT__) return;
    const cont = document.querySelector('#quiz-container');
    const dataNode = document.getElementById('quiz-data');
    if (!cont || !dataNode) return;

    const uiNode = document.getElementById('quiz-ui');
    const ui = uiNode ? JSON.parse(uiNode.textContent) : {};
    const data = JSON.parse(dataNode.textContent);

    try {
      new TGKQuiz({ containerSelector: '#quiz-container', ui, data });
      window.__TGK_QUIZ__ = true;
    } catch (e) {
      console.error('[TGKQuiz] failed to init', e);
    }
  });
})();
