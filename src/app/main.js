import { characters } from "../../data/characters.js";
import { dialogueSets } from "../../data/dialogues.js";
import { messages } from "../../data/messages.js";
import { scenes } from "../../data/scenes.js";
import { gainAffection, stateFor, subscribe, markMessageRead, replyToMessage, startScene, advanceScene, completeScene, sendMessage, dismissLevel, resetCharacter, playerHasFlag } from "../core/game-state.js";
import { getAffectionLevel } from "../core/affection.js";
import { CharacterStage } from "../ui/character-stage.js";
import { homeView } from "../ui/home-view.js";
import { messagesView } from "../ui/messages-view.js";
import { profileView } from "../ui/profile-view.js";
import { sceneView, storyView } from "../ui/story-view.js";

const activeCharacterId = "male_01";
const character = characters[activeCharacterId];
const app = document.querySelector("#app");
const toastRegion = document.querySelector("#toast-region");
const viewState = { route: "home", face: "idle", motion: "", line: character.greeting };
let toastTimer;

if (!stateFor(activeCharacterId).inbox.length) {
  sendMessage(activeCharacterId, "msg_first");
  window.setTimeout(() => toast("沈砚舟发来一条消息"), 850);
}

function toast(message) {
  toastRegion.innerHTML = '<div class="toast"><span>✦</span>' + message + '</div>';
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { toastRegion.innerHTML = ""; }, 2800);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function syncNavigation() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === viewState.route || (viewState.route === "scene" && button.dataset.route === "story"));
  });
}

function render() {
  const state = stateFor(activeCharacterId);
  if (viewState.route === "home") {
    app.innerHTML = homeView(character, state);
    const stage = new CharacterStage(app.querySelector("#character-stage"));
    stage.render(character, state, viewState);
  } else if (viewState.route === "messages") {
    app.innerHTML = messagesView(character, state);
  } else if (viewState.route === "story") {
    app.innerHTML = storyView(character, state);
  } else if (viewState.route === "scene") {
    app.innerHTML = sceneView(scenes.tide_archive, state);
  } else {
    app.innerHTML = profileView(character, state);
  }
  syncNavigation();
}

function navigate(route) {
  viewState.route = route;
  if (route === "messages") markMessageRead(activeCharacterId, stateFor(activeCharacterId).inbox.at(-1));
  render();
  app.focus({ preventScroll: true });
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    navigate(routeButton.dataset.route);
    return;
  }
  const touchButton = event.target.closest("[data-touch]");
  if (touchButton) {
    const zone = touchButton.dataset.touch;
    const line = randomItem(dialogueSets.touch[zone]);
    const priorLevel = getAffectionLevel(character, stateFor(activeCharacterId).affection).label;
    viewState.line = line;
    viewState.face = zone === "head" ? "amused" : "attentive";
    viewState.motion = "portrait-react";
    gainAffection(activeCharacterId, zone === "hand" ? 3 : 2);
    toast(stateFor(activeCharacterId).affection > 0 ? "好感度增加 · " + (zone === "hand" ? "+3" : "+2") : "他看向了你");
    if (getAffectionLevel(character, stateFor(activeCharacterId).affection).label !== priorLevel) toast("关系变得更亲近了 · " + getAffectionLevel(character, stateFor(activeCharacterId).affection).label);
    return;
  }
  if (event.target.closest("[data-interact]")) {
    const line = randomItem(dialogueSets.casual);
    viewState.line = line;
    viewState.face = "attentive";
    viewState.motion = "portrait-react";
    gainAffection(activeCharacterId, 1);
    toast("他回应了你 · 好感度 +1");
    return;
  }
  const replyButton = event.target.closest("[data-reply]");
  if (replyButton) {
    const message = messages.find((item) => item.id === replyButton.dataset.message);
    const index = Number(replyButton.dataset.reply);
    replyToMessage(activeCharacterId, message.id, index, message.replies[index]);
    render();
    toast("回复已送达");
    return;
  }
  const choiceButton = event.target.closest("[data-choice]");
  if (choiceButton) {
    viewState.line = choiceButton.dataset.response;
    advanceScene(activeCharacterId);
    gainAffection(activeCharacterId, 2);
    return;
  }
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  switch (actionButton.dataset.action) {
    case "random-action":
      viewState.line = randomItem(dialogueSets.actions);
      viewState.face = randomItem(["idle", "serious", "amused"]);
      viewState.motion = "portrait-shift";
      render();
      break;
    case "dialogue": {
      const conditional = dialogueSets.conditional.find((item) => playerHasFlag(activeCharacterId, item.id));
      const affectionLine = [...dialogueSets.affection].reverse().find((item) => stateFor(activeCharacterId).affection >= item.at);
      viewState.line = conditional?.text || affectionLine?.text || randomItem(dialogueSets.casual);
      viewState.face = conditional || affectionLine ? "attentive" : "idle";
      viewState.motion = "portrait-react";
      render();
      break;
    }
    case "start-scene":
      startScene(activeCharacterId);
      navigate("scene");
      break;
    case "next-scene":
      advanceScene(activeCharacterId);
      break;
    case "finish-scene":
      completeScene(activeCharacterId, scenes.tide_archive.reward);
      viewState.line = dialogueSets.conditional.find((item) => item.id === "scene_complete").text;
      viewState.face = "serious";
      navigate("story");
      toast("调查完成 · 收到沈砚舟的新消息");
      break;
    case "leave-scene":
      navigate("story");
      break;
    case "locked-story":
      toast("再多聊一会儿，档案就会向你开放。");
      break;
    case "reset-save":
      if (window.confirm("要重置沈砚舟的本地关系进度和剧情记录吗？")) {
        resetCharacter(activeCharacterId);
        viewState.line = character.greeting;
        viewState.face = "idle";
        viewState.motion = "";
        navigate("home");
        toast("本地进度已重新开始");
      }
      break;
  }
});

subscribe(({ characterId, state }) => {
  if (characterId !== activeCharacterId) return;
  render();
  if (state.newLevel) {
    const level = state.newLevel;
    dismissLevel(activeCharacterId);
    toast("关系更新 · " + level);
  }
});

window.setInterval(() => {
  if (viewState.route !== "home") return;
  const state = stateFor(activeCharacterId);
  if (state.sceneCompleted && !state.inbox.includes("msg_after_scene")) sendMessage(activeCharacterId, "msg_after_scene");
}, 8000);

render();
