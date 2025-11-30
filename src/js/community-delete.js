import { 
  getFirestore, 
  doc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

// Global delete click handler
document.addEventListener("click", async (event) => {
  if (!event.target.classList.contains("btn-delete-comment")) return;

  const commentId = event.target.dataset.commentId;
  const topicId = event.target.dataset.topicId;

  const confirmed = await showDeleteModal();
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "topics", topicId, "replies", commentId));

    // Remove element from DOM
    const el = document.getElementById(`comment-${commentId}`);
    if (el) el.remove();

  } catch (err) {
    console.error("Delete failed:", err);
    alert("Unable to delete comment. Check permissions.");
  }
});

// Modal logic
function showDeleteModal() {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirm-delete-modal");
    const yesBtn = document.getElementById("confirm-delete-yes");
    const noBtn = document.getElementById("confirm-delete-no");

    modal.hidden = false;

    yesBtn.onclick = () => {
      modal.hidden = true;
      resolve(true);
    };
    noBtn.onclick = () => {
      modal.hidden = true;
      resolve(false);
    };
  });
}
