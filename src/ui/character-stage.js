const emotes = {
  idle: "目光落在窗外，像是在听很远的潮声。",
  attentive: "他的视线停在你身上，眉心微微松开。",
  amused: "唇边浮起一点笑意，很快又被他藏好。",
  serious: "他收敛神色，安静地等你把话说完。"
};

export class CharacterStage {
  constructor(root) {
    this.root = root;
  }

  render(character, state, options = {}) {
    const face = options.face || "idle";
    this.root.innerHTML =
      '<div class="stage-sky">' +
        '<div class="window-frame"><i></i><b></b><span class="moon"></span></div>' +
        '<div class="stage-glow"></div>' +
        '<div class="stage-caption"><span>FOG HARBOR</span><span>23:18 · 微潮</span></div>' +
        '<div class="portrait-wrap ' + (options.motion || "") + " " + face + '">' +
          '<div class="portrait-halo"></div>' +
          '<img class="portrait" src="assets/male-01-portrait.svg" alt="' + character.name + ' 的原创角色立绘" data-interact />' +
          '<button class="touch-zone touch-head" data-touch="head" aria-label="轻触头部"><span>头发</span></button>' +
          '<button class="touch-zone touch-chest" data-touch="chest" aria-label="轻触胸口"><span>胸口</span></button>' +
          '<button class="touch-zone touch-hand" data-touch="hand" aria-label="轻触手部"><span>手</span></button>' +
        '</div>' +
        '<div class="stage-dialogue" aria-live="polite">' +
          '<span class="dialogue-mark">“</span><p>' + (options.line || character.greeting) + '</p>' +
          '<small>' + (emotes[face] || emotes.idle) + '</small>' +
        '</div>' +
        '<div class="stage-hint"><span class="pulse-ring"></span> 点击他，看看会发生什么</div>' +
      '</div>';
  }
}
