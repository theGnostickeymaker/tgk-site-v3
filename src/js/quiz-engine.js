// @ts-nocheck
// TGK Quiz Engine v2.2 – One-at-a-time, score, perfect glow, retry

(function () {
  function renderQuestion(container, data, index, score) {
    const q = data.questions[index];
    container.innerHTML = `
      <div class="quiz-question">
        <p class="quiz-progress">Question ${index + 1} of ${data.questions.length}</p>
        <p class="quiz-prompt">${q.prompt}</p>
        <ul class="quiz-options">
          ${q.options
            .map(
              (opt) => `
            <li>
              <button type="button" 
                class="quiz-button" 
                data-answer="${opt.key}" 
                data-q="${index}">
                ${opt.key}. ${opt.label}
              </button>
            </li>
          `
            )
            .join("")}
        </ul>
        <p class="quiz-feedback" data-q="${index}"></p>
        <p class="quiz-score">Current score: ${score} / ${data.questions.length}</p>
      </div>
    `;
  }

  function renderComplete(container, quizData, score) {
    container.innerHTML = `
      <div class="quiz-complete">
        <p>🎉 Well done! You finished the quiz.</p>
        <p>Your final score: <strong>${score}</strong> / ${quizData.questions.length}</p>
        <div class="btn-wrap">
          <button class="btn btn-outline quiz-retry">🔄 Try Again</button>
        </div>
      </div>
    `;

    const completeBox = container.querySelector(".quiz-complete");
    if (score === quizData.questions.length) {
      completeBox.classList.add("perfect");
    }
  }

  function init(root = document) {
    const blocks = root.querySelectorAll("[data-quiz-id]");
    blocks.forEach((block) => {
      const quizId = block.dataset.quizId;
      const container = block.querySelector(".quiz-container");

      fetch("/quiz/index.json")
        .then((res) => res.json())
        .then((json) => {
          const quizData = json[quizId];
          if (!quizData) {
            console.warn(`[TGK QUIZ] ❌ No quiz data for ${quizId}`);
            container.innerHTML = `<p class="text-muted">⚠️ Quiz not found.</p>`;
            return;
          }

          let current = 0;
          let score = 0;

          function startQuiz() {
            current = 0;
            score = 0;
            renderQuestion(container, quizData, current, score);
          }

          // 🔹 Start initially
          startQuiz();

          block.addEventListener("click", (e) => {
            const btn = e.target;

            if (btn.classList.contains("quiz-button")) {
              const qIndex = parseInt(btn.dataset.q, 10);
              const picked = btn.dataset.answer;
              const question = quizData.questions[qIndex];
              const feedback = block.querySelector(
                `.quiz-feedback[data-q="${qIndex}"]`
              );

              if (picked === question.answer) {
                score++;
                feedback.innerHTML = `✅ Correct! <br><small>${question.explanation}</small>`;
                feedback.className = "quiz-feedback correct";
              } else {
                feedback.innerHTML = `❌ Not quite.<br><small>${question.explanation}</small>`;
                feedback.className = "quiz-feedback incorrect";
              }

              setTimeout(() => {
                current++;
                if (current < quizData.questions.length) {
                  renderQuestion(container, quizData, current, score);
                } else {
                  renderComplete(container, quizData, score);
                }
              }, 1200);
            }

            // 🔹 Retry handler
            if (btn.classList.contains("quiz-retry")) {
              startQuiz();
            }
          });
        })
        .catch((err) => {
          console.error("[TGK QUIZ] Error loading quiz JSON:", err);
          container.innerHTML = `<p class="text-muted">⚠️ Error loading quiz.</p>`;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", () => init());
})();
