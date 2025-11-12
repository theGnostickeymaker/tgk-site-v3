/* ===========================================================
   📄 TGK — Download System v1.1
   =========================================================== */

console.log("[TGK] Download v1.1 loaded");

/* ===========================================================
   ✦ Lazy Load html2pdf (UMD-compatible)
   =========================================================== */
async function loadHtml2Pdf() {
  if (window.html2pdf) return window.html2pdf;
  await import("https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js");
  return window.html2pdf;
}

/* ===========================================================
   ✦ Toast Integration
   =========================================================== */
import { showToast } from "/js/toast.js";

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

  const html2pdf = await loadHtml2Pdf(); // ✅ dynamic load
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
