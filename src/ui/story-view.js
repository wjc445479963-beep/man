import { escapeHtml as h } from "./html.js?v=0.3.0";

export function storyView(character, state) {
  const unlocked = state.affection >= 10 || state.sceneCompleted;
  return '<section class="page subpage story-page"><header class="subpage-header"><div><div class="eyebrow">CASE FILE · F-001</div><h1>潮汐档案</h1><p>雾港的旧气象站，留下一段不属于任何人的记录。</p></div><span class="secure-tag">异常气象调查局</span></header>' +
    '<div class="story-detail"><div class="story-art"><div class="art-moon"></div><div class="art-building"><i></i><b></b><span></span></div><div class="art-sea"><i></i><b></b></div><span class="art-coordinate">37° 48′ N&nbsp;&nbsp; 122° 24′ W</span><span class="art-title">雾港 · 旧气象站</span></div>' +
      '<section class="story-detail-card panel-card"><div class="eyebrow">今晚的调查</div><h2>' + (state.sceneCompleted ? "记录已归档" : unlocked ? "有人听见了第二道信号" : "待关系推进后开放") + '</h2>' +
        '<p>' + (state.sceneCompleted ? "你和" + character.name + "已经听完那段录音。他将调查继续下去，而这次没有一个人承担所有决定。" : "一段旧录音出现异常频率，最后一次记录时间正是他入职的前一晚。和他一起前往旧气象站，确认空白记录的来源。") + '</p>' +
        '<div class="case-meta"><span><small>预计时长</small><b>约 2 分钟</b></span><span><small>关系门槛</small><b>' + (state.sceneCompleted ? "已完成" : "好感 · 10") + '</b></span></div>' +
        '<button class="primary-button ' + (!unlocked ? "disabled" : "") + '" data-action="' + (unlocked ? "start-scene" : "locked-story") + '" ' + (!unlocked ? "disabled" : "") + '>' +
          (state.sceneCompleted ? "重温这段记录" : unlocked ? "进入旧气象站" : "好感达到 10 后解锁") + ' <span>↗</span></button>' +
        (state.sceneCompleted ? '<div class="file-stamp">ARCHIVED · 22:43</div>' : '<div class="file-foot">完成互动或回复消息以推进关系</div>') +
      '</section></div><div class="archive-row"><span>相关档案</span><span>01 / 01 · 潮汐信标</span></div></section>';
}

export function sceneView(scene, state, character) {
  const step = Math.min(state.sceneStep, scene.beats.length - 1);
  const beat = scene.beats[step];
  const last = step === scene.beats.length - 1;
  const choices = beat.choices && !state.sceneResponse
    ? '<div class="scene-choices">' + beat.choices.map((choice, index) => '<button class="scene-choice" data-choice="' + index + '">' + h(choice.text) + '<span>↗</span></button>').join("") + '</div>'
    : '<button class="primary-button scene-next" data-action="' + (last ? "finish-scene" : "next-scene") + '">' + (last ? "结束调查" : "继续") + ' <span>→</span></button>';
  return '<section class="scene-screen"><div class="scene-backdrop"><div class="scene-moon"></div><div class="scene-cliff"></div><div class="scene-waves"></div><div class="scene-building"><i></i><b></b><span></span></div><div class="scene-fog fog-one"></div><div class="scene-fog fog-two"></div></div>' +
    '<div class="scene-top"><button class="back-link" data-action="leave-scene">← <span>退出档案</span></button><span class="scene-location">雾港 · 旧气象站</span><span class="scene-counter">' + String(step + 1).padStart(2, "0") + ' / ' + String(scene.beats.length).padStart(2, "0") + '</span></div>' +
    '<div class="scene-copy"><div class="scene-time">23:18 · 微潮</div><div class="scene-speaker">' + h(state.sceneResponse ? character.name : beat.speaker) + '</div><p class="' + (state.sceneResponse ? 'scene-response' : '') + '">' + h(state.sceneResponse || beat.text) + '</p>' + choices + '</div>' +
    '<div class="scene-progress"><i style="width:' + Math.round(((step + 1) / scene.beats.length) * 100) + '%"></i></div></section>';
}
