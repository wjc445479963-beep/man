const SAVE_KEY = "fog-harbor-save-v1";

export function loadSave() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (saved && typeof saved === "object" && saved.characters && typeof saved.characters === "object" && !Array.isArray(saved.characters)) return saved;
  } catch { /* Ignore a damaged local save and start clean. */ }
  return { characters: {} };
}

export function saveGame(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); return true; }
  catch { window.dispatchEvent(new Event("game-storage-error")); return false; }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
