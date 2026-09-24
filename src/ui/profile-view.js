import { getAffectionLevel } from "../core/affection.js";

export function profileView(character, state) {
  const level = getAffectionLevel(character, state.affection);
  return '<section class="page subpage profile-page"><header class="subpage-header"><div><div class="eyebrow">PERSONNEL FILE · 01</div><h1>角色档案</h1><p>雾港异常气象调查局 · 内部资料</p></div><span class="secure-tag">◈ 限本人查看</span></header>' +
    '<div class="profile-layout"><section class="profile-portrait-card"><div class="profile-art-glow"></div><img src="assets/male-01-portrait.svg" alt="' + character.name + ' 的档案立绘" /><div class="profile-index">MALE_01 <span>·</span> ACTIVE</div></section>' +
      '<section class="profile-copy panel-card"><div class="profile-name-row"><div><div class="eyebrow">' + character.callSign + '</div><h2>' + character.name + '</h2></div><span class="level-tag">' + level.label + '</span></div>' +
        '<p class="profile-intro">' + character.firstImpression + '</p>' +
        '<div class="profile-facts"><div><small>年龄</small><b>' + character.age + ' 岁</b></div><div><small>身高</small><b>' + character.height + '</b></div><div><small>身份</small><b>' + character.role + '</b></div></div>' +
        '<div class="profile-section"><div class="eyebrow">第一印象</div><p>' + character.mood + '。' + character.voice + '</p></div>' +
        '<div class="profile-section"><div class="eyebrow">外观记录 · 暂定</div><div class="tag-row"><span>' + character.visual.hair + '发</span><span>' + character.visual.eyes + '眼</span><span>' + character.visual.wardrobe + '</span></div></div>' +
        '<div class="profile-affection"><span>当前关系 · ' + level.label + '</span><b>' + state.affection + ' / 100</b></div>' +
        '<button class="quiet-button" data-action="reset-save">重新开始本地进度</button>' +
      '</section></div><div class="profile-note"><span>设计注记</span><p>当前为第一版工作设定。身份、经历、弱点、秘密和成长线会在后续角色阶段继续完善。</p></div></section>';
}
