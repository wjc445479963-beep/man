import { characters } from "../../data/characters.js?v=0.3.0";
import { scenes } from "../../data/scenes.js?v=0.3.0";
import { addAffection } from "./affection.js?v=0.3.0";
import { loadSave, saveGame } from "./save.js?v=0.3.0";

const store = loadSave();
const listeners = new Set();
function createCharacterState() {
  return { affection: 0, flags: [], inbox: [], readMessages: [], replies: [], sceneCompleted: false, sceneStarted: false, sceneStep: 0, lastMessageAt: null, newLevel: null, memories: {}, journal: [], awards: [], sceneSelections: {}, sceneResponse: null, pendingMessages: [] };
}
export function stateFor(id) {
  if (!store.characters[id] || typeof store.characters[id] !== "object") store.characters[id] = createCharacterState();
  const state = store.characters[id];
  for (const [key, value] of Object.entries(createCharacterState())) if (state[key] === undefined) state[key] = value;
  return state;
}
function commit(id) { saveGame(store); listeners.forEach(listener => listener({ characterId: id, state: stateFor(id) })); }
export function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function gainAffection(id, amount) { const state = stateFor(id); addAffection(state, characters[id], amount); commit(id); return state; }
export function markMessageRead(id, messageId) {
  const state = stateFor(id);
  const ids = messageId ? [messageId] : state.inbox;
  ids.forEach(value => { if (state.inbox.includes(value) && !state.readMessages.includes(value)) state.readMessages.push(value); });
  commit(id); return state;
}
export function replyToMessage(id, messageId, replyIndex, response) {
  const state = stateFor(id), prefix = messageId + ":";
  if (!state.inbox.includes(messageId) || !response || state.replies.some(reply => reply.key.startsWith(prefix))) return state;
  state.replies.push({ key: prefix + replyIndex, text: response.text, response: response.response });
  addAffection(state, characters[id], response.affection); commit(id); return state;
}
export function localDate(now = new Date()) { return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-"); }
export function recordMoment(id, moment, memories = {}) {
  const state = stateFor(id), date = localDate(), key = date + ":" + moment.id;
  const earned = !state.awards.includes(key) ? moment.reward : 0;
  if (!state.awards.includes(key)) {
    state.awards.push(key); state.awards = state.awards.slice(-120);
    state.journal.push({ id: key, date, title: moment.title, detail: moment.detail }); state.journal = state.journal.slice(-30);
    addAffection(state, characters[id], earned);
  }
  Object.assign(state.memories, memories);
  if (moment.message && !state.inbox.includes(moment.message) && !state.pendingMessages.some(item => item.id === moment.message)) state.pendingMessages.push({ id: moment.message, at: Date.now() + 3200 });
  commit(id); return earned;
}
export function deliverPendingMessages(id, now = Date.now()) {
  const state = stateFor(id), ready = state.pendingMessages.filter(item => item.at <= now);
  if (!ready.length) return [];
  const ids = ready.map(item => item.id).filter(messageId => !state.inbox.includes(messageId));
  state.inbox.push(...ids); state.pendingMessages = state.pendingMessages.filter(item => item.at > now);
  state.lastMessageAt = new Date(now).toISOString(); commit(id); return ids;
}
export function startScene(id) {
  const state = stateFor(id);
  if (state.affection < scenes.tide_archive.requirement && !state.sceneCompleted) return false;
  state.sceneStarted = true; state.sceneStep = 0; state.sceneResponse = null; state.sceneSelections = {}; commit(id); return true;
}
export function chooseScene(id, index) {
  const state = stateFor(id), beat = scenes.tide_archive.beats[state.sceneStep], choice = beat?.choices?.[index];
  if (!state.sceneStarted || state.sceneResponse || !choice) return false;
  state.sceneSelections[state.sceneStep] = index; state.sceneResponse = choice.response; commit(id); return true;
}
export function advanceScene(id) {
  const state = stateFor(id), scene = scenes.tide_archive;
  if (!state.sceneStarted || (scene.beats[state.sceneStep]?.choices && !state.sceneResponse)) return;
  state.sceneResponse = null; state.sceneStep = Math.min(state.sceneStep + 1, scene.beats.length - 1); commit(id);
}
export function completeScene(id, reward) {
  const state = stateFor(id);
  if (!state.sceneStarted || state.sceneStep !== scenes.tide_archive.beats.length - 1) return state;
  if (!state.sceneCompleted) {
    state.sceneCompleted = true;
    if (!state.flags.includes(reward.flag)) state.flags.push(reward.flag);
    if (!state.inbox.includes(reward.message)) state.inbox.push(reward.message);
    addAffection(state, characters[id], reward.affection);
    const choice = scenes.tide_archive.beats[5].choices[state.sceneSelections[5] ?? 0];
    state.journal.push({ id: "tide_archive", date: localDate(), title: "我们一起听见的潮声", detail: choice.response }); state.journal = state.journal.slice(-30);
  }
  state.sceneStarted = false; commit(id); return state;
}
export function sendMessage(id, messageId) {
  const state = stateFor(id); if (state.inbox.includes(messageId)) return;
  state.inbox.push(messageId); state.lastMessageAt = new Date().toISOString(); commit(id);
}
export function dismissLevel(id) { stateFor(id).newLevel = null; saveGame(store); }
export function resetCharacter(id) { store.characters[id] = { ...createCharacterState(), inbox: ["msg_first"] }; commit(id); }
export function playerHasFlag(id, flag) { return stateFor(id).flags.includes(flag); }
