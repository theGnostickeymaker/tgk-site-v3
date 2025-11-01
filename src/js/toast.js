/* ===========================================================
   🜂 TGK Toast Utility — Global Notification System
   v1.0 — Reusable across all pillars and scripts
   =========================================================== */

/**
 * Show a TGK toast message.
 * @param {string} msg - The message text to display.
 * @param {"info"|"success"|"error"|"remove"} [type="info"] - The toast style.
 */
export function showToast(msg, type = "info") {
  let container = document.getElementById("toast-container");

  // 🔹 Create container if missing
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  // 🔹 Create the toast element
  const toast = document.createElement("div");
  toast.className = `tgk-toast ${type}`;
  toast.textContent = msg;

  // 🔹 Append + auto-remove
  container.appendChild(toast);

  // Force reflow for animation (so fade-out always triggers)
  void toast.offsetWidth;

  // Remove after animation
  setTimeout(() => toast.remove(), 3500);
}

/**
 * Clear all active toasts immediately.
 */
export function clearToasts() {
  const container = document.getElementById("toast-container");
  if (container) container.innerHTML = "";
}
