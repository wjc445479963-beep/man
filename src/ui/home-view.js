import { getAffectionLevel } from "../core/affection.js";

export function homeView(character, state) {
  const level = getAffectionLevel(character, state.affection);
  const range = Math.max(1, level.next - level.floor);
  const progress = level.index === character.affinity.labels.length - 1
    ? 100
    : Math.round(((state.affection - level.floor) / range) * 100);
  const sceneReady = state.affection >= 10;
  return '<section class="page home-page">' +
    '<header class="topbar"><div><div class="eyebrow">FOG HARBOR · 09:24 PM</div><div class="greeting-line">夜色正好，<span>你回来了。</span></div></div>' +
    '<button class="icon-button weather-pill" data-action="random-action"><span class="weather-icon">◌</span><span>雾 · 16°</span></button></header>' +
    '<div class="home-layout"><section class="hero-panel">' +
      '<div class="hero-meta"><span class="live-pill"><i></i> 在线</span><span>调查局 · 休息室</span></div>' +
      '<div id="character-stage" class="character-stage"></div>' +
      '<div class="hero-footer"><div><div class="hero-name">' + character.name + '<span class="name-mark">舟</span></div><div class="hero-role">' + character.callSign + '</div></div>' +
      '<button class="round-action" data-action="random-action" aria-label="看看他的动作">↻</button></div>' +
    '</section>' +
    '<aside class="side-stack"><section class="affection-card panel-card"><div class="card-top"><span>关系进度</span><span class="level-tag">' + level.label + '</span></div>' +
      '<div class="affection-number">' + String(state.affection).padStart(2, "0") + '<small> / 100</small></div>' +
      '<div class="progress-track"><i style="width:' + progress + '%"></i></div>' +
      '<div class="affection-foot"><span>你们的默契正在增加</span><span>' + (level.index === 3 ? "已抵达" : "下一级 " + level.next) + '</span></div>' +
      '<div class="divider"></div><div class="relationship-note">“他开始把决定留给你。”</div></section>' +
      '<section class="message-card panel-card"><div class="card-top"><span>他的消息</span><button class="text-link" data-route="messages">查看全部 <span>↗</span></button></div>' +
        '<div class="message-preview"><span class="message-avatar">沈</span><div><strong>沈砚舟</strong><p>' + (state.sceneCompleted ? "下次雾散之前，陪我去潮汐站走走。" : "我刚结束外勤。你那边下雨了吗？") + '</p></div><i class="message-unread"></i></div>' +
        '<button class="wide-link" data-route="messages">打开通讯 <span>→</span></button></section>' +
      '<section class="story-card"><div class="story-card-copy"><span class="eyebrow">本日档案 · 01</span><h2>潮汐档案</h2><p>' + (state.sceneCompleted ? "已归档 · 新消息待回复" : "旧气象站的记录出现一段空白") + '</p>' +
        '<button class="story-open" data-route="story">' + (state.sceneCompleted ? "回看记录" : sceneReady ? "开始调查" : "关系熟悉后解锁") + ' <span>↗</span></button></div>' +
        '<div class="story-emblem"><span>潮</span><i></i><b></b></div>' +
      '</section></aside></div>' +
    '<div class="home-bottom"><span>与你相处的第 ' + (1 + state.replies.length + (state.sceneCompleted ? 1 : 0)) + ' 次记录</span><button data-action="dialogue">听他说说 <span>→</span></button></div>' +
  '</section>';
}
