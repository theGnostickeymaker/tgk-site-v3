import {
  getFirestore,
  collection,
  getDocs,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const db = getFirestore();

export async function loadJuryConsole(user) {
  const container = document.getElementById("jury-cases");
  const panel = document.getElementById("jury-console");

  if (!container || !panel) return;

  container.innerHTML = `<p class="muted small">Loading assigned cases…</p>`;

  try {
    const casesSnap = await getDocs(collection(db, "juryCases"));

    const assignedCases = [];

    for (const caseDoc of casesSnap.docs) {
      const jurorRef = doc(
        db,
        "juryCases",
        caseDoc.id,
        "jurors",
        user.uid
      );

      const jurorSnap = await getDoc(jurorRef);

      if (jurorSnap.exists()) {
        assignedCases.push({ id: caseDoc.id, ...caseDoc.data() });
      }
    }

    if (assignedCases.length === 0) {
      panel.style.display = "none";
      return;
    }

    panel.style.display = "block";
    container.innerHTML = "";

    for (const data of assignedCases) {
      const card = document.createElement("div");
      card.className = "jury-case-card";

      card.innerHTML = `
        <h4>${data.title}</h4>
        <p class="muted small">Status: ${data.status}</p>
        <p class="muted small">Required votes: ${data.requiredVotes}</p>
        <div class="btn-wrap">
          <a href="/court/jury/${data.id}/" class="btn outline">
            Review case
          </a>
        </div>
      `;

      container.appendChild(card);
    }

  } catch (err) {
    console.error("[Jury] Failed to load cases:", err);
    container.innerHTML =
      `<p class="muted small">Unable to load jury cases at this time.</p>`;
  }
}
