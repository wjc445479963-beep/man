// Each conversation has an explicit beginning, player choices and a remembered ending.
export const encounters = {
  evening: {
    title: "把今晚留给你", reward: 4, memory: "一盏留给你的灯", message: "msg_after_evening",
    nodes: {
      start: { text: "站在门口做什么？过来坐。今晚的时间，我留出来了。", aside: "他把手边的文件合上，视线终于从窗外转向你。", face: "attentive", choices: [
        { text: "今天有一点累。", next: "tired", mood: "tired" },
        { text: "有件好事，想第一个告诉你。", next: "happy", mood: "happy" },
        { text: "没什么事，就是想见你。", next: "miss", mood: "miss" }
      ] },
      tired: { text: "那今天不用表现得很好。想说的话我听，不想说，我们就坐一会儿。", aside: "他向旁边让出一点位置，没有追问原因。", face: "attentive", choices: [
        { text: "陪我待一会儿就好。", next: "stay", preference: "quiet" },
        { text: "你也有撑不住的时候吗？", next: "honest" }
      ] },
      happy: { text: "先等一下。", aside: "他将手机翻扣在桌上，唇边的笑意很浅。", face: "amused", next: "listen" },
      listen: { text: "好了。现在没有别的事比你这件更重要。说吧，我想听完整的。", aside: "那道惯常审视别人的目光，此刻只带着耐心。", face: "amused", choices: [
        { text: "你这么认真，我反而有点紧张。", next: "smile" },
        { text: "其实，能这样跟你说话就是好事。", next: "stay" }
      ] },
      miss: { text: "……这倒是个很充分的理由。下次可以直接进来，不用提前想好借口。", aside: "他看着你，先移开视线的反而是他。", face: "amused", choices: [
        { text: "那你会等我吗？", next: "lamp" },
        { text: "原来你也会不好意思。", next: "smile" }
      ] },
      honest: { text: "有。我会把灯关掉，一个人坐到天亮。以前觉得这样就算处理好了。", aside: "他停了一下，手指不再敲着扶手。", face: "serious", next: "honestEnd" },
      honestEnd: { text: "今天换一种。你不用一个人撑着，我也试着不那么做。", aside: "你们之间的安静，慢慢变得可以依靠。", face: "attentive", end: true },
      stay: { text: "好。窗边有点凉，坐近一些。你不用找话说，我知道你在。", aside: "他没有再看时间。窗外的雨替你们接住了沉默。", face: "soft", end: true },
      lamp: { text: "会。这盏灯，以后给你留着。不过太晚的话，记得让我去接你。", aside: "他把灯调暗一格，留下一圈恰好容得下两个人的暖光。", face: "amused", end: true },
      smile: { text: "别这样看着我。我还没习惯……有人专程为我而来。", aside: "他轻轻笑了一声，这次没有掩饰。", face: "amused", end: true }
    }
  },
  hair: {
    title: "发梢的距离", reward: 3, memory: "他为你低下了头",
    nodes: {
      start: { text: "这一缕？从外面回来就没注意。", aside: "他微微低头，把那缕凌乱的银发留在你指尖旁。", face: "attentive", choices: [
        { text: "别动，很快就好。", next: "gentle" },
        { text: "其实这样也挺好看的。", next: "tease" }
      ] },
      gentle: { text: "嗯，我不动。……以前没人会管这些。", aside: "他闭了闭眼，肩膀慢慢放松下来。", face: "soft", next: "end" },
      tease: { text: "那你刚才是在找一个靠近的理由？", aside: "他眼里浮起一点笑，却没有向后退。", face: "amused", next: "end" },
      end: { text: "下次也交给你。只要你愿意。", aside: "发梢被理顺了，你的手停留了比必要更久的一瞬。", face: "amused", end: true }
    }
  },
  hand: {
    title: "掌心的温度", reward: 3, memory: "第一次认真握住他的手",
    nodes: {
      start: { text: "怎么，手又凉了？", aside: "他注意到靠近的指尖，把手留在扶手边，等你决定。", face: "attentive", choices: [
        { text: "嗯，借我一点温度。", next: "warm" },
        { text: "只是想确认，你真的在这里。", next: "here" },
        { text: "还没准备好，先这样就好。", next: "space" }
      ] },
      warm: { text: "过来。握着就好，不用急着松开。", aside: "他放轻了力道，等你的手指慢慢放松。", face: "soft", next: "end" },
      here: { text: "在。你看，我也会冷，也会累。你碰到的，都是我。", aside: "他没有笑你的认真，只把手往你这边送了一点。", face: "attentive", next: "end" },
      space: { text: "好。你什么时候愿意，再告诉我。", aside: "他把距离留给你，也把那只手留在原处。", face: "attentive", end: true },
      end: { text: "暖一点了吗？下次想找我，就像现在这样。", aside: "隔着手套，你依然感觉到了他回应的力道。", face: "amused", end: true }
    }
  },
  lapel: {
    title: "靠近之前", reward: 2, memory: "替他理好的衣领",
    nodes: {
      start: { text: "衣领折进去了？难怪刚才一直不舒服。", aside: "他松开领口的扣子，侧身让你看清。", face: "attentive", choices: [
        { text: "你总是照顾别人，自己倒很随便。", next: "care" },
        { text: "好了。下次出门记得照镜子。", next: "mirror" }
      ] },
      care: { text: "被你发现了。那这件事，你愿不愿意偶尔提醒我？", aside: "他没有用玩笑把你的关心挡回去。", face: "amused", end: true },
      mirror: { text: "记住了。不过镜子不会像你这样，一边皱眉一边替我整理。", aside: "他抚平你碰过的那一角衣领，像留下一个记号。", face: "amused", end: true }
    }
  }
};

export function welcomeLine(state, hour = new Date().getHours()) {
  if (state.memories?.mood === "tired") return "上次你说有点累。今天好一点了吗？不急，坐下来慢慢说。";
  if (state.memories?.mood === "happy") return "你上次说的好事，我还记得。今天也想听你说说。";
  if (state.memories?.preference === "quiet") return "灯给你留着。今天也不用找话说，坐在这里就好。";
  if (state.affection >= 55) return "听见脚步声就知道是你。外面凉，还是坐到我身边来吧。";
  if (state.affection >= 20) return "我猜你会来，留了你喜欢的位置。今天想先听你说。";
  if (hour >= 23 || hour < 5) return "这么晚还没睡？过来坐一会儿。等你困了，我再关灯。";
  if (hour < 12) return "早。窗边的位置给你留着，今天想先做什么？";
  if (hour < 18) return "忙完了？过来歇一会儿。我刚好有时间听你说话。";
  return "你来了。文件已经收好了，今晚可以慢慢陪你。";
}

export const presenceMoments = {
  quiet: { title: "让时间慢一点", text: "不用找话说。我就在这里，陪你。", aside: "雨落在窗外。他合上文件，把这一分钟空了出来。" },
  quietFinished: { text: "原来一分钟也可以这样过。下次你想安静一会儿，还来这里。", aside: "他看了眼钟，又看向你，露出一点笑意。" },
  paused: { text: "好，先到这里。想说的时候，我再听。", aside: "他没有催你，把下一句话的时间交给了你。" },
  idle: { aside: "他从窗外收回目光，等你回过神。" }
};
