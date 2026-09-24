import { messages } from "../../data/messages.js?v=0.2.1";

function escapeHtml(text) {
  return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function messagesView(character, state) {
  const available = messages.filter((message) => state.inbox.includes(message.id));
  const current = available[available.length - 1];
  const replies = current ? state.replies.filter((reply) => reply.key.startsWith(current.id + ":")) : [];
  const chat = current ? '<div class="chat-date">今天 · 雾港时间</div><div class="chat-message incoming"><span class="message-avatar">王</span><div><div class="bubble">' + escapeHtml(current.text) + '</div><small>' + current.time + '</small></div></div>' +
    replies.map((reply) => '<div class="chat-message outgoing"><div><div class="bubble">' + escapeHtml(reply.text) + '</div><small>你 · 已送达</small></div></div><div class="chat-message incoming"><span class="message-avatar">王</span><div><div class="bubble">' + escapeHtml(reply.response) + '</div><small>王彦祖 · 已读</small></div></div>').join("") +
    (replies.length === 0 ? '<div class="reply-options">' + current.replies.map((reply, index) => '<button class="reply-option" data-reply="' + index + '" data-message="' + current.id + '"><span>' + escapeHtml(reply.text) + '</span><b>↗</b></button>').join("") + '</div>' : '<div class="reply-done">— 他正在看着窗外，像是在等雾散 —</div>') : "";
  return '<section class="page subpage messages-page"><header class="subpage-header"><div><div class="eyebrow">PERSONAL LINE · 01</div><h1>通讯</h1><p>不必时刻在线，他会记得回来找你。</p></div><span class="secure-tag">◈ 私人频道</span></header>' +
    '<div class="messages-layout"><aside class="inbox-panel panel-card"><div class="inbox-heading"><span>最近联系</span><span>01</span></div>' +
      '<button class="inbox-contact active"><span class="message-avatar large">王</span><span class="contact-copy"><b>' + character.name + '</b><small>' + (state.sceneCompleted ? "新约定 · 潮汐站" : "调查结束了吗？") + '</small></span><span class="contact-time">20:16<i></i></span></button>' +
      '<div class="inbox-note"><span class="note-mark">✳</span><p>有些消息没有期限。<br/>有些人会记得你说过的话。</p></div></aside>' +
      '<section class="chat-panel panel-card"><header class="chat-header"><span class="message-avatar">王</span><div><b>' + character.name + '</b><small><i></i> 正在雾港 · 休息室</small></div><button class="icon-button chat-more" data-route="profile">···</button></header>' +
        '<div class="chat-content">' + chat + '</div><footer class="chat-composer"><span class="composer-lock">⌁</span><span>选择一句回复，或留给下一次见面</span><button class="composer-send" disabled>↑</button></footer>' +
      '</section></div></section>';
}
