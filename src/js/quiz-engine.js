(function(){
  function renderQuiz(el, data){
    if (!data || !data.questions) return;
    const container = el.querySelector(".quiz-container");
    container.innerHTML = data.questions.map((q,i)=>`
      <div class="quiz-question">
        <p class="quiz-prompt">${i+1}. ${q.prompt}</p>
        <ul class="quiz-options">
          ${q.options.map((opt,idx)=>{
            const letter = String.fromCharCode(65+idx);
            return `<li><button type="button" class="quiz-button" data-answer="${letter}" data-q="${i}">${letter}. ${opt}</button></li>`;
          }).join("")}
        </ul>
        <p class="quiz-feedback" data-q="${i}"></p>
      </div>
    `).join("");
  }

  function init(root=document){
    const blocks = root.querySelectorAll("[data-quiz]");
    blocks.forEach(block=>{
      const script = block.querySelector(".quiz-data");
      if(!script) return;
      const data = JSON.parse(script.textContent);
      renderQuiz(block, data);

      block.addEventListener("click", e=>{
        const btn = e.target.closest(".quiz-button");
        if(!btn) return;
        const qIndex = btn.dataset.q;
        const picked = btn.dataset.answer;
        const correct = data.questions[qIndex].correct;
        const feedback = block.querySelector(`.quiz-feedback[data-q="${qIndex}"]`);
        feedback.textContent = (picked===correct) ? "✅ Correct!" : "❌ Not quite, try again.";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", ()=>init());
})();
