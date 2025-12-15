// /js/community-delete.js
// TGK Community - Delete module (disabled)
//
// Delete is handled inside /js/discussion-topic.js as a soft delete (tombstone).
// This file intentionally contains no click handler to avoid double delete logic.

export function showDeleteModal() {
  // Optional helper for future modal integration.
  // For now, return a resolved promise to keep API shape if you ever call it.
  return Promise.resolve(true);
}
