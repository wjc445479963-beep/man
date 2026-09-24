const SAVE_KEY = "fog-harbor-save-v1";

export function loadSave() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (saved && typeof saved === "object" && saved.characters) return saved;
  } catch { /* Ignore a damaged local save and start clean. */ }
  return { characters: {} };
}

export function saveGame(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
