export const characters = {
  male_01: {
    id: "male_01",
    name: "王彦祖",
    presentation: {
      portrait: "assets/male-01-portrait.png?v=0.3.0",
      blink: "assets/male-01-blink.png?v=0.3.0",
      smile: "assets/male-01-smile.png?v=0.3.0",
      zones: [
        { id: "hair", label: "发梢", x: .43, y: .082, rx: .21, ry: .093 },
        { id: "lapel", label: "衣领", x: .48, y: .32, rx: .18, ry: .11 },
        { id: "hand", label: "手心", x: .245, y: .57, rx: .18, ry: .13 }
      ]
    },
    callSign: "雾港档案 · 特别顾问",
    age: 30,
    height: "189 cm",
    role: "异常气象调查局 · 首席调查官",
    mood: "冷静、自持，习惯先观察再开口",
    firstImpression: "他很少解释自己的决定，却总会把最危险的一段路留给自己。",
    visual: { hair: "雾银", eyes: "琥珀棕", wardrobe: "黑曜色立领礼装、古金色星轨装饰" },
    voice: "句子短，语气平稳；不说空泛的承诺，用具体行动表达在意。",
    affinity: { thresholds: [0, 20, 55, 100], labels: ["初识", "熟悉", "信任", "默契"] },
    greeting: "回来得正好。窗外的雾刚散一点。"
  }
};
