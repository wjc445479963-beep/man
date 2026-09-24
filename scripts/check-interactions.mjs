import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const storage = new Map([["fog-harbor-save-v1", JSON.stringify({ characters: { male_01: { affection: 7, flags: [], inbox: ["msg_first"], readMessages: [], replies: [], sceneCompleted: false, sceneStarted: false, sceneStep: 0, newLevel: null } } })]]);
globalThis.localStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
let storageFailures = 0;
globalThis.window = { dispatchEvent: () => { storageFailures++; } };
const game = await import("../src/core/game-state.js");
const { Conversation } = await import("../src/core/conversation.js");
const { encounters } = await import("../data/companionship.js");
const { characters } = await import("../data/characters.js");
const { scenes } = await import("../data/scenes.js");
const { CharacterStage } = await import("../src/ui/character-stage.js");
const { sceneView } = await import("../src/ui/story-view.js");
const { messagesView } = await import("../src/ui/messages-view.js");
const { messages } = await import("../data/messages.js");

const id = "male_01", state = game.stateFor(id);
assert.equal(state.affection, 7, "legacy relationship score survives migration");
assert.deepEqual(state.journal, []);
assert.deepEqual(state.pendingMessages, []);
const conversation = new Conversation(); conversation.start("evening"); conversation.choose(0); conversation.choose(0);
assert.equal(conversation.node.end, true);
assert.deepEqual(conversation.memory, { mood: "tired", preference: "quiet" });
const moment = { id: "evening", title: "一盏留给你的灯", detail: conversation.node.text, reward: 4, message: "msg_after_evening" };
assert.equal(game.recordMoment(id, moment, conversation.memory), 4);
assert.equal(game.recordMoment(id, moment), 0, "repeating an encounter cannot farm affection");
assert.equal(state.journal.length, 1);
assert.equal(state.pendingMessages.length, 1);
assert.equal(JSON.parse(storage.get("fog-harbor-save-v1")).characters[id].pendingMessages.length, 1, "delayed messages survive page close");
assert.deepEqual(game.deliverPendingMessages(id, Date.now() + 10000), ["msg_after_evening"]);
assert.deepEqual(game.deliverPendingMessages(id, Date.now() + 20000), []);
assert.equal(state.memories.mood, "tired");

for (const [key, encounter] of Object.entries(encounters)) {
  const walk = (nodeId, path = []) => {
    assert(!path.includes(nodeId), `${key}: dialogue must terminate`);
    const node = encounter.nodes[nodeId]; assert(node, `${key}: transition target exists`);
    assert(node.text && node.aside);
    const targets = node.choices?.map(choice => choice.next) || (node.next ? [node.next] : []);
    assert(node.end || targets.length, `${key}: no dead ends`);
    targets.forEach(next => walk(next, [...path, nodeId]));
  };
  walk("start");
}

const first = messages.find(message => message.id === "msg_first");
game.replyToMessage(id, first.id, 0, first.replies[0]); const repliedScore = state.affection;
game.replyToMessage(id, first.id, 1, first.replies[1]);
assert.equal(state.affection, repliedScore, "one reward/reply per message, including alternate choices");
assert.equal(state.replies.length, 1);
const historyHtml = messagesView(characters[id], state);
assert(historyHtml.includes(first.text) && historyHtml.includes(messages.find(message => message.id === "msg_after_evening").text), "all received messages remain visible");

game.resetCharacter(id); const fresh = game.stateFor(id);
assert.equal(game.startScene(id), false, "story unlock enforced in state layer");
game.gainAffection(id, 10); assert.equal(game.startScene(id), true);
for (let i = 0; i < 5; i++) game.advanceScene(id);
game.advanceScene(id); assert.equal(fresh.sceneStep, 5, "cannot skip required choice");
game.chooseScene(id, 1);
assert.equal(fresh.sceneResponse, scenes.tide_archive.beats[5].choices[1].response);
assert(sceneView(scenes.tide_archive, fresh, characters[id]).includes(fresh.sceneResponse), "chosen response displayed before advancing");
for (let i = 0; i < 3; i++) game.advanceScene(id);
game.completeScene(id, scenes.tide_archive.reward); assert.equal(fresh.affection, 22);
assert(fresh.inbox.includes("msg_after_scene")); assert(fresh.sceneCompleted);
game.startScene(id);
assert(sceneView(scenes.tide_archive, fresh, characters[id]).includes("next-scene"), "replay does not exit at first beat");
for (let i = 0; i < 5; i++) game.advanceScene(id);
game.chooseScene(id, 0); for (let i = 0; i < 3; i++) game.advanceScene(id);
game.completeScene(id, scenes.tide_archive.reward); assert.equal(fresh.affection, 22, "replay gives no duplicate reward");

const stage = new CharacterStage(null); stage.media = characters[id].presentation;
for (const rect of [{ left: 20, top: 60, width: 340, height: 340 * 1672 / 941 }, { left: -30, top: -50, width: 760, height: 760 * 1672 / 941 }]) {
  stage.plane = { getBoundingClientRect: () => rect };
  for (const zone of stage.media.zones) assert.equal(stage.hitTest(rect.left + zone.x * rect.width, rect.top + zone.y * rect.height).id, zone.id, "touch coordinates follow scaling, crop and zoom");
  assert.equal(stage.hitTest(rect.left + rect.width * .97, rect.top + rect.height * .9), undefined);
}
const originalSet = localStorage.setItem; localStorage.setItem = () => { throw new Error("quota"); };
assert.doesNotThrow(() => game.gainAffection(id, 1)); assert.equal(storageFailures, 1); localStorage.setItem = originalSet;

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
assert.match(html, /<meta name="app-version" content="\d+\.\d+\.\d+"/);
assert(!html.includes("$10."), "release updater preserves HTML metadata");
console.log("PASS: save migration, all dialogue branches, daily rewards, durable follow-up messages, reply deduplication, full message history, story choice/replay, scaled touch coordinates, storage fallback and release metadata.");
