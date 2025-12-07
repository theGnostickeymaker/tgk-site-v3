// src/js/dashboard-reputation.js

// New:
import { auth } from "/js/firebase-init.js";
import { Reputation } from "./reputation.js";

/**
 * Convert a Keys score into a symbolic rank.
 * These are *reputation ranks*, not payment tiers.
 */
function keysRank(score) {
  if (score >= 500) return "Guardian";
  if (score >= 200) return "Keeper";
  if (score >= 50)  return "Initiate";
  if (score >= 1)   return "Seeker";
  return "Observer";
}

export async function loadReputationWidget() {
  const container = document.getElementById("widget-key-balance");
  if (!container) return;

  const section = container.closest("section");

  const user = auth.currentUser;
  if (!user) {
    container.innerHTML = `
      <p class="muted small">Sign in to begin earning Keys.</p>
    `;
    if (section) section.hidden = false;
    return;
  }

  const rep = await Reputation.get();

  if (!rep) {
    container.innerHTML = `
      <p class="muted small">
        You have not earned any Keys yet. Join a discussion thread and share a Steel Man reply to begin.
      </p>
    `;
    if (section) section.hidden = false;
    return;
  }

  const score = rep.score || 0;
  const rank = keysRank(score);

  container.innerHTML = `
    <div class="keys-card">
      <h4 class="small-heading">Your Keys</h4>
      <p class="keys-main">
        <span class="keys-score">${score}</span>
        <span class="keys-unit">Keys</span>
      </p>
      <p class="keys-rank muted">
        Rank: <strong>${rank}</strong>
      </p>
      <p class="keys-help small muted">
        Keys are earned automatically for constructive participation in TGK Community threads.
      </p>
    </div>
  `;

  if (section) section.hidden = false;
}
