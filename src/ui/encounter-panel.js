import { escapeHtml as h } from "./html.js?v=0.3.0";

export class EncounterPanel {
  constructor(root, character) { this.root = root; this.character = character; this.abort = new AbortController(); this.root.addEventListener("click", event => { if (event.target.closest("[data-skip-text]")) this.finishTyping(); }, { signal: this.abort.signal }); }
  render({ title, text, aside, choices, next, end, active, quiet, history = [] }) {
    clearInterval(this.timer);
    this.root.innerHTML = `<div class="encounter-heading"><span>${h(title || "今晚，想和他说点什么？")}</span>${active ? '<button data-action="end-encounter" aria-label="暂时结束这段对话">先到这里</button>' : '<span class="small-star">✧</span>'}</div>
      <div class="speech"><span class="speech-name">${h(this.character.name)}</span><button class="speech-text" data-skip-text aria-label="${h(text)}"><span class="typed-text" aria-hidden="true"></span><span class="sr-only">${h(text)}</span></button><p class="speech-aside">${h(aside || "他收起手边的文件，安静地听你说。")}</p><span class="typing-hint" aria-hidden="true">轻触文字，显示完整内容</span></div>
      <div class="encounter-controls">${quiet ? '<div class="quiet-time"><span>一起安静地待着</span><strong id="quiet-clock">01:00</strong><small>不必说话，随时可以离开。</small></div><button class="encounter-primary" data-action="stop-quiet">和他聊聊 <span>→</span></button>' : choices ? choices.map((choice, index) => `<button class="encounter-choice" data-conversation-choice="${index}"><span>${h(choice.text)}</span><b>↗</b></button>`).join("") : active ? `<button class="encounter-primary" data-action="${end ? "finish-encounter" : "next-encounter"}">${end ? "记住这一刻" : "继续听他说"} <span>→</span></button>` : '<button class="encounter-primary" data-encounter="evening">和他聊聊今天 <span>→</span></button><button class="encounter-secondary" data-action="quiet">一起安静待一分钟</button>'}</div>
      ${history.length > 1 ? `<details class="conversation-log"><summary>回看刚才的话</summary>${history.map(line => `<p><b>${h(line.speaker)}</b>${h(line.text)}</p>`).join("")}</details>` : ""}`;
    this.text = text; this.textNode = this.root.querySelector(".typed-text"); this.index = 0;
    this.typing = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!this.typing) this.finishTyping();
    else { this.setControlsDisabled(true); this.timer = setInterval(() => { this.textNode.textContent = text.slice(0, ++this.index); if (this.index >= text.length) this.finishTyping(); }, 27); }
  }
  setControlsDisabled(value) { this.root.querySelectorAll(".encounter-controls button").forEach(button => { button.disabled = value; }); }
  finishTyping() { clearInterval(this.timer); this.typing = false; if (this.textNode) this.textNode.textContent = this.text; this.setControlsDisabled(false); const hint = this.root.querySelector(".typing-hint"); if (hint) hint.style.visibility = "hidden"; }
  dispose() { clearInterval(this.timer); this.abort.abort(); }
}
