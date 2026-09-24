import { getAffectionLevel } from "../core/affection.js?v=0.3.0";
import { APP_VERSION } from "../../data/app-version.js?v=0.3.0";
import { escapeHtml as h } from "./html.js?v=0.3.0";

export function homeView(character) {
  const date = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
  return `<section class="companion-page">
    <header class="companion-header"><div><p class="companion-kicker">雾 港 来 信 <span>／</span> BETWEEN THE TIDES</p><h1>把这一刻，留给彼此。</h1></div><div class="header-right"><span>${date}</span><button class="ambient-toggle" data-action="ambient" aria-pressed="false">♫ 雨声 · 关</button></div></header>
    <div class="companion-layout">
      <section class="presence-card" aria-label="与${h(character.name)}相处"><div id="character-stage" class="presence-stage"></div>
        <div class="presence-top"><span class="presence-tag"><i></i> 此刻，与你同在</span><span>雾港 · 私人休息室</span></div>
        <div class="presence-title"><span class="presence-chapter">01 / 一盏留给你的灯</span><h2>${h(character.name)}</h2><p id="presence-mood">他抬起眼，注意到了你的到来。</p></div>
        <div class="camera-tools"><button data-action="stage-guides" aria-pressed="false" title="显示可以触碰的位置">◎ 触碰提示</button><button data-action="camera-close" aria-pressed="false">⌕ 靠近看</button></div>
      </section>
      <aside class="companion-sidebar"><div class="relationship-strip"><span>你们的关系 <b id="relationship-label"></b></span><span id="relationship-score"></span><div class="relationship-track"><i id="relationship-fill"></i></div></div>
        <section class="encounter-card" id="encounter-panel" aria-label="面对面交谈"></section>
        <div class="touch-actions" aria-label="与他互动"><button data-encounter="hair"><span>〰</span>理理头发</button><button data-encounter="hand"><span>⌁</span>牵他的手</button><button data-encounter="lapel"><span>⋈</span>整理衣领</button></div>
        <details class="memory-book"><summary>相处手记 <span id="memory-count">0 段记忆</span></summary><div id="memory-list"></div></details>
        <div class="companion-links"><button data-route="messages"><span>✉</span><div>他的消息<small id="message-status">私人通讯</small></div><i class="unread-dot"></i><b>↗</b></button><button data-route="story"><span>▤</span><div>一起去看看<small id="story-status">潮汐档案</small></div><b>↗</b></button></div>
      </aside>
    </div><footer class="companion-footer"><span>不必一直说话，也不必每次都有理由。</span><span>雾港来信 · v${APP_VERSION}</span></footer>
  </section>`;
}

export function updateHomeStatus(character, state) {
  const level = getAffectionLevel(character, state.affection);
  const label = document.querySelector("#relationship-label"); if (!label) return;
  label.textContent = level.label;
  document.querySelector("#relationship-score").textContent = `${state.affection} / 100`;
  document.querySelector("#relationship-fill").style.width = `${state.affection}%`;
  document.querySelector("#story-status").textContent = state.sceneCompleted ? "我们的共同记忆" : state.affection >= 10 ? "今夜，可以出发了" : "好感 10 · 解锁一段同行";
  document.querySelector("#message-status").textContent = state.inbox.some(id => !state.readMessages.includes(id)) ? "有一封未读来信" : "聊天记录都在这里";
  document.querySelector("#memory-count").textContent = `${state.journal.length} 段记忆`;
  document.querySelector("#memory-list").innerHTML = state.journal.length ? [...state.journal].reverse().map(entry => `<article><time>${h(entry.date)}</time><strong>${h(entry.title)}</strong><p>${h(entry.detail)}</p></article>`).join("") : '<p class="empty-memory">一段聊完的话，一次认真的靠近，都会被记在这里。</p>';
}
