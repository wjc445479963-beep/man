import { characters } from "../../data/characters.js";
import { addAffection } from "./affection.js";
import { loadSave, saveGame } from "./save.js";

const store = loadSave();
const listeners = new Set();

function createCharacterState() {
  return {
    affection: 0,
    flags: [],
    inbox: [],
    readMessages: [],
    replies: [],
    sceneCompleted: false,
    sceneStarted: false,
    sceneStep: 0,
    lastMessageAt: null,
    newLevel: null
  };
}

export function stateFor(id) {
  if (!store.characters[id]) store.characters[id] = createCharacterState();
  return store.characters[id];
}

function commit(id) {
  saveGame(store);
  listeners.forEach((listener) => listener({ characterId: id, state: stateFor(id) }));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function gainAffection(id, amount) {
  const state = stateFor(id);
  addAffection(state, characters[id], amount);
  commit(id);
  return state;
}

export function markMessageRead(id, messageId) {
  const state = stateFor(id);
  if (!state.readMessages.includes(messageId)) state.readMessages.push(messageId);
  commit(id);
  return state;
}

export function replyToMessage(id, messageId, replyIndex, response) {
  const state = stateFor(id);
  const key = messageId + ":" + replyIndex;
  if (!state.replies.some((reply) => reply.key === key)) {
    state.replies.push({ key, text: response.text, response: response.response });
    addAffection(state, characters[id], response.affection);
  }
  commit(id);
  return state;
}

export function startScene(id) {
  const state = stateFor(id);
  state.sceneStarted = true;
  state.sceneStep = 0;
  commit(id);
}

export function advanceScene(id) {
  const state = stateFor(id);
  state.sceneStep += 1;
  commit(id);
}

export function completeScene(id, reward) {
  const state = stateFor(id);
  if (!state.sceneCompleted) {
    state.sceneCompleted = true;
    if (!state.flags.includes(reward.flag)) state.flags.push(reward.flag);
    if (!state.inbox.includes(reward.message)) state.inbox.push(reward.message);
    addAffection(state, characters[id], reward.affection);
  }
  commit(id);
  return state;
}

export function sendMessage(id, messageId) {
  const state = stateFor(id);
  if (!state.inbox.includes(messageId)) state.inbox.push(messageId);
  state.lastMessageAt = new Date().toISOString();
  commit(id);
}

export function dismissLevel(id) {
  const state = stateFor(id);
  state.newLevel = null;
  commit(id);
}

export function resetCharacter(id) {
  store.characters[id] = { ...createCharacterState(), inbox: ["msg_first"] };
  commit(id);
}

export function playerHasFlag(id, flag) {
  return stateFor(id).flags.includes(flag);
}
