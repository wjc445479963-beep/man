import { characters } from "../../data/characters.js?v=0.3.0";
import { dialogueSets } from "../../data/dialogues.js?v=0.3.0";
import { messages } from "../../data/messages.js?v=0.3.0";
import { scenes } from "../../data/scenes.js?v=0.3.0";
import { welcomeLine, presenceMoments } from "../../data/companionship.js?v=0.3.0";
import { stateFor, subscribe, markMessageRead, replyToMessage, startScene, chooseScene, advanceScene, completeScene, sendMessage, dismissLevel, resetCharacter, recordMoment, deliverPendingMessages } from "../core/game-state.js?v=0.3.0";
import { Conversation } from "../core/conversation.js?v=0.3.0";
import { AmbientAudio } from "../core/ambient-audio.js?v=0.3.0";
import { CharacterStage } from "../ui/character-stage.js?v=0.3.0";
import { EncounterPanel } from "../ui/encounter-panel.js?v=0.3.0";
import { homeView, updateHomeStatus } from "../ui/home-view.js?v=0.3.0";
import { messagesView } from "../ui/messages-view.js?v=0.3.0";
import { profileView } from "../ui/profile-view.js?v=0.3.0";
import { sceneView, storyView } from "../ui/story-view.js?v=0.3.0";

const activeCharacterId = Object.keys(characters)[0];
const character = characters[activeCharacterId];
const app = document.querySelector("#app"), toastRegion = document.querySelector("#toast-region");
const conversation = new Conversation(), ambient = new AmbientAudio();
const viewState = { route: "home", line: null, aside: null };
let stage, panel, toastTimer, replyTimer, pendingReply = null;
let quietActive = false, quietRemaining = 60000, quietTimer, lastQuietTick = 0, lastInteraction = Date.now(), storageWarningShown = false;

function toast(message) {
  const node = document.createElement("div"); node.className = "toast"; node.textContent = "✧  " + message;
  toastRegion.replaceChildren(node); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastRegion.replaceChildren(), 3600);
}
function syncNavigation() {
  const state = stateFor(activeCharacterId), unread = state.inbox.some(id => !state.readMessages.includes(id));
  document.querySelectorAll("[data-route]").forEach(button => {
    button.classList.toggle("active", button.dataset.route === viewState.route || (viewState.route === "scene" && button.dataset.route === "story"));
    const dot = button.querySelector(".unread-dot"); if (dot) dot.style.display = unread ? "block" : "none";
  });
  const audioButton = document.querySelector("[data-action=ambient]");
  if (audioButton) { audioButton.textContent = ambient.enabled ? "♫ 雨声 · 开" : "♫ 雨声 · 关"; audioButton.setAttribute("aria-pressed", String(ambient.enabled)); }
}
function updatePanel() {
  if (!panel || viewState.route !== "home") return;
  document.querySelector(".companion-page").classList.toggle("is-talking", conversation.active || quietActive);
  if (quietActive) {
    panel.render({ ...presenceMoments.quiet, quiet: true });
    stage.react("soft"); updateQuietClock();
  } else if (conversation.active) {
    const node = conversation.node;
    panel.render({ ...node, title: conversation.encounter.title, active: true, history: conversation.history });
    stage.react(node.face, conversation.id); document.querySelector("#presence-mood").textContent = node.aside;
  } else {
    panel.render({ text: viewState.line || welcomeLine(stateFor(activeCharacterId)), aside: viewState.aside });
    stage.react("attentive");
  }
}
function render() {
  stage?.dispose(); panel?.dispose(); stage = null; panel = null;
  const state = stateFor(activeCharacterId);
  if (viewState.route === "home") {
    app.innerHTML = homeView(character, state);
    stage = new CharacterStage(app.querySelector("#character-stage"), startEncounter); stage.render(character);
    panel = new EncounterPanel(app.querySelector("#encounter-panel"), character); updatePanel(); updateHomeStatus(character, state);
  } else if (viewState.route === "messages") {
    app.innerHTML = messagesView(character, state, pendingReply);
    const content = app.querySelector(".chat-content"); if (content) content.scrollTop = content.scrollHeight;
  } else if (viewState.route === "story") app.innerHTML = storyView(character, state);
  else if (viewState.route === "scene") app.innerHTML = sceneView(scenes.tide_archive, state, character);
  else app.innerHTML = profileView(character, state);
  syncNavigation();
}
function navigate(route) {
  if (!["home", "messages", "story", "scene", "profile"].includes(route)) return;
  viewState.route = route; lastQuietTick = performance.now();
  if (route === "messages") markMessageRead(activeCharacterId);
  render(); app.focus({ preventScroll: true });
}
function startEncounter(id) {
  lastInteraction = Date.now();
  if (conversation.active) { panel?.finishTyping(); toast("他还在听你说。可以继续这段话，或点「先到这里」。"); return; }
  stopQuiet(false);
  if (conversation.start(id)) { updatePanel(); if (innerWidth <= 760) document.querySelector("#encounter-panel")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest" }); }
}
function finishEncounter() {
  if (!conversation.node?.end) return;
  const encounter = conversation.encounter, lastLine = conversation.node.text;
  const earned = recordMoment(activeCharacterId, { id: conversation.id, title: encounter.memory, detail: lastLine, reward: encounter.reward, message: encounter.message }, conversation.memory);
  conversation.reset(); viewState.line = lastLine; viewState.aside = "这一刻，已经记在你们的相处手记里。"; updatePanel(); stage.react("amused");
  toast(earned ? `记下一段相处 · 好感 +${earned}` : "今天已经记下这段相处，随时可以重温。");
  if (innerWidth <= 760) document.querySelector(".presence-card")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
}
function updateQuietClock() {
  const clock = document.querySelector("#quiet-clock"); if (!clock) return;
  const seconds = Math.max(0, Math.ceil(quietRemaining / 1000)); clock.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
function startQuiet() {
  if (conversation.active) return;
  quietActive = true; quietRemaining = 60000; lastQuietTick = performance.now(); updatePanel();
  clearInterval(quietTimer);
  quietTimer = setInterval(() => {
    const now = performance.now(), delta = now - lastQuietTick; lastQuietTick = now;
    if (document.hidden || viewState.route !== "home") return;
    quietRemaining -= Math.min(delta, 1500); updateQuietClock();
    if (quietRemaining <= 0) {
      stopQuiet(false); const earned = recordMoment(activeCharacterId, { id: "quiet", title: "一起安静坐过的一分钟", detail: "不说话的时候，也有人愿意陪在身边。", reward: 2 });
      viewState.line = presenceMoments.quietFinished.text; viewState.aside = presenceMoments.quietFinished.aside; updatePanel(); stage?.react("amused"); toast(earned ? "共同的安静，也被记住了 · 好感 +2" : "又一起度过了一段安静的时间。");
    }
  }, 250);
}
function stopQuiet(refresh = true) { clearInterval(quietTimer); quietActive = false; if (refresh) updatePanel(); }

document.addEventListener("click", async event => {
  lastInteraction = Date.now();
  const routeButton = event.target.closest("[data-route]"); if (routeButton) { navigate(routeButton.dataset.route); return; }
  const encounterButton = event.target.closest("[data-encounter]"); if (encounterButton) { startEncounter(encounterButton.dataset.encounter); return; }
  const conversationChoice = event.target.closest("[data-conversation-choice]");
  if (conversationChoice) { if (!panel?.typing && conversation.choose(Number(conversationChoice.dataset.conversationChoice))) updatePanel(); return; }
  const replyButton = event.target.closest("[data-reply]");
  if (replyButton) {
    if (pendingReply) return;
    const message = messages.find(item => item.id === replyButton.dataset.message), index = Number(replyButton.dataset.reply);
    if (!message?.replies[index]) return;
    pendingReply = { id: message.id, index }; render();
    replyTimer = setTimeout(() => { pendingReply = null; replyToMessage(activeCharacterId, message.id, index, message.replies[index]); }, 1100); return;
  }
  const choiceButton = event.target.closest("[data-choice]"); if (choiceButton) { chooseScene(activeCharacterId, Number(choiceButton.dataset.choice)); return; }
  const actionButton = event.target.closest("[data-action]"); if (!actionButton) return;
  switch (actionButton.dataset.action) {
    case "ambient": try { await ambient.toggle(); syncNavigation(); } catch (error) { toast(error.message); } break;
    case "stage-guides": actionButton.setAttribute("aria-pressed", String(stage.toggleGuides())); break;
    case "camera-close": { const close = stage.toggleClose(); actionButton.setAttribute("aria-pressed", String(close)); actionButton.textContent = close ? "⌕ 回到原处" : "⌕ 靠近看"; break; }
    case "next-encounter": if (!panel.typing && conversation.next()) updatePanel(); break;
    case "finish-encounter": if (!panel.typing) finishEncounter(); break;
    case "end-encounter": conversation.reset(); viewState.line = presenceMoments.paused.text; viewState.aside = presenceMoments.paused.aside; updatePanel(); break;
    case "quiet": startQuiet(); break;
    case "stop-quiet": stopQuiet(); break;
    case "random-action": case "dialogue": startEncounter("evening"); break;
    case "start-scene": if (startScene(activeCharacterId)) navigate("scene"); break;
    case "next-scene": advanceScene(activeCharacterId); break;
    case "finish-scene": completeScene(activeCharacterId, scenes.tide_archive.reward); viewState.line = dialogueSets.conditional[0].text; navigate("story"); toast("共同的记录已经归档"); break;
    case "leave-scene": navigate("story"); break;
    case "locked-story": toast("好感达到 10 后，可以邀请他一起出发。"); break;
    case "reset-save":
      if (confirm(`要重置${character.name}的本地关系进度和相处手记吗？`)) {
        clearTimeout(replyTimer); pendingReply = null; stopQuiet(false); conversation.reset(); resetCharacter(activeCharacterId); viewState.line = null; viewState.aside = null; navigate("home"); toast("本地进度已重新开始");
      } break;
  }
});
subscribe(({ characterId, state }) => {
  if (characterId !== activeCharacterId) return;
  if (viewState.route === "home") { updateHomeStatus(character, state); syncNavigation(); } else render();
  if (state.newLevel) { const level = state.newLevel; dismissLevel(activeCharacterId); toast("你们更亲近了 · " + level); }
});
document.addEventListener("visibilitychange", () => { lastQuietTick = performance.now(); });
window.addEventListener("game-storage-error", () => { if (!storageWarningShown) { storageWarningShown = true; toast("浏览器暂时无法保存进度，本次相处仍可继续。"); } });
setInterval(() => {
  if (viewState.route !== "home" || conversation.active || quietActive || document.hidden || Date.now() - lastInteraction < 75000) return;
  lastInteraction = Date.now(); viewState.line = dialogueSets.casual[Math.floor(Math.random() * dialogueSets.casual.length)]; viewState.aside = presenceMoments.idle.aside; updatePanel();
}, 15000);
if (!stateFor(activeCharacterId).inbox.length) sendMessage(activeCharacterId, "msg_first");
deliverPendingMessages(activeCharacterId);
setInterval(() => { if (deliverPendingMessages(activeCharacterId).length) toast(character.name + "发来一条新消息"); }, 2000);
render();
