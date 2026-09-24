export function getAffectionLevel(character, score) {
  const { thresholds, labels } = character.affinity;
  let index = 0;
  thresholds.forEach((threshold, i) => {
    if (score >= threshold) index = i;
  });
  return { index, label: labels[index], next: thresholds[index + 1] ?? 100, floor: thresholds[index] };
}

export function addAffection(state, character, amount) {
  const before = getAffectionLevel(character, state.affection);
  state.affection = Math.max(0, Math.min(100, state.affection + amount));
  const after = getAffectionLevel(character, state.affection);
  if (after.index > before.index) state.newLevel = after.label;
  return state.affection;
}
