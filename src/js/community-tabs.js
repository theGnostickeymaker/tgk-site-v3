document.addEventListener("click", (event) => {
  const el = event.target.closest(".page-tabs .tab-link");
  if (!el) return;

  const targetId = el.getAttribute("href");
  if (!targetId || !targetId.startsWith("#")) return;

  event.preventDefault();

  const target = document.querySelector(targetId);
  if (!target) return;

  // Delay for JS-rendered content
  setTimeout(() => {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 50);
});
