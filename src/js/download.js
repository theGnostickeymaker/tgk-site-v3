/* ===========================================================
   📄 TGK — Download System v1.0
   Client-side PDF generator for Scrolls
   =========================================================== */
console.log("[TGK] Download v1.0 loaded");

import "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";

/* ===========================================================
   ✦ Toast Helper (reuse global if present)
   =========================================================== */
function showToast(msg, type = "info") {
  if (window.showToast) return window.showToast(msg, type);
  const c = document.createElement("div");
  c.className = `tgk-toast ${type}`;
  c.textContent = msg;
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 4000);
}

/* ===========================================================
   ✦ Generate + Download
   =========================================================== */
async function generatePDF(btn) {
  const userTier = localStorage.getItem("tgk-tier") || "free";
  if (userTier === "free") {
    showToast("⚠️ Downloads are for Initiate tier and above.", "error");
    return;
  }

  const main = document.querySelector("main.scroll-content");
  if (!main) {
    showToast("⚠️ Content not found", "error");
    return;
  }

  const filename = btn.dataset.filename || "tgk-scroll.pdf";
  btn.disabled = true;
  btn.textContent = "⏳";

  const options = {
    margin: 10,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  try {
    await html2pdf().from(main).set(options).save();
    showToast("📄 Scroll saved as PDF", "success");
  } catch (err) {
    console.error("[TGK] Download error:", err);
    showToast("⚠️ PDF generation failed", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "📄";
  }
}

/* ===========================================================
   ✦ Bind Buttons
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".page-download").forEach((btn) => {
    btn.addEventListener("click", () => generatePDF(btn));
  });
});
