import { messages } from "../../data/messages.js?v=0.3.0";
import { escapeHtml as h } from "./html.js?v=0.3.0";

export function messagesView(character, state, pending = null) {
  const available = state.inbox.map(id => messages.find(message => message.id === id)).filter(Boolean);
  const avatar = h(character.name.slice(0, 1));
  const chat = available.map(message => {
    const replies = state.replies.filter(reply => reply.key.startsWith(message.id + ":"));
    const waiting = pending?.id === message.id;
    return `<div class="message-history-divider">${h(message.time)} · 私人来信</div><div class="chat-message incoming"><span class="message-avatar">${avatar}</span><div><div class="bubble">${h(message.text)}</div><small>${h(character.name)}</small></div></div>` +
      replies.map(reply => `<div class="chat-message outgoing"><div><div class="bubble">${h(reply.text)}</div><small>你 · 已送达</small></div></div><div class="chat-message incoming"><span class="message-avatar">${avatar}</span><div><div class="bubble">${h(reply.response)}</div><small>${h(character.name)} · 已读</small></div></div>`).join("") +
      (waiting ? `<div class="chat-message outgoing"><div><div class="bubble">${h(message.replies[pending.index].text)}</div><small>你 · 已送达</small></div></div><div class="chat-typing" role="status">他正在输入 · · ·</div>` : !replies.length ? `<div class="reply-options">${message.replies.map((reply, index) => `<button class="reply-option" data-reply="${index}" data-message="${message.id}" ${pending ? "disabled" : ""}><span>${h(reply.text)}</span><b>↗</b></button>`).join("")}</div>` : "");
  }).join("");
  return `<section class="page subpage messages-page"><header class="subpage-header"><div><div class="eyebrow">PERSONAL LINE · 01</div><h1>通讯</h1><p>说过的话，都会好好留下来。</p></div><span class="secure-tag">◈ 私人频道</span></header>
    <div class="messages-layout"><aside class="inbox-panel panel-card"><div class="inbox-heading"><span>最近联系</span><span>01</span></div>
      <button class="inbox-contact active"><span class="message-avatar large">${avatar}</span><span class="contact-copy"><b>${h(character.name)}</b><small>${available.length} 封来信 · 全部记录</small></span></button>
      <div class="inbox-note"><span class="note-mark">✳</span><p>有些消息没有期限。<br>有些人会记得你说过的话。</p><button class="text-link" data-route="home">回去陪他 →</button></div></aside>
      <section class="chat-panel panel-card"><header class="chat-header"><span class="message-avatar">${avatar}</span><div><b>${h(character.name)}</b><small><i></i> 在雾港 · 休息室</small></div><button class="icon-button chat-more" data-route="profile" aria-label="查看角色档案">···</button></header>
        <div class="chat-content">${chat || '<p class="empty-memory">暂时没有来信。先去和他聊聊吧。</p>'}</div><footer class="chat-composer"><span class="composer-lock">⌁</span><span>选择一句回复，或留给下一次见面</span></footer>
      </section></div></section>`;
}
