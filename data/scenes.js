export const scenes = {
  tide_archive: {
    id: "tide_archive",
    title: "潮汐档案",
    subtitle: "雾港 · 旧气象站 / 23:18",
    requirement: 10,
    beats: [
      { speaker: "叙述", text: "凌晨前的雾港像一张没有寄出的底片。旧气象站靠着海崖，门上的铜牌被盐雾磨得发白。" },
      { speaker: "沈砚舟", text: "门锁没有被撬过。有人从里面离开，又把潮汐记录留在桌上。" },
      { speaker: "沈砚舟", text: "录音里有两道频率。一道是气象站的旧信标，另一道……和我第一次听见雾鸣时一模一样。" },
      { speaker: "叙述", text: "海风卷起一张泛黄的值班表。最末一栏写着一个熟悉的日期，墨迹却是新的。" },
      { speaker: "沈砚舟", text: "这个日期是我入职的前一晚。调查局的档案里，没有那天的记录。" },
      { speaker: "叙述", text: "他没有碰那张纸，只把决定留给了你。", choices: [
        { text: "先听完录音，再决定这张纸怎么处理。", response: "好。你听细节，我看门外。" },
        { text: "把值班表收起来，先查是谁刚来过。", response: "明白。证据不会自己消失，但人会。" }
      ] },
      { speaker: "叙述", text: "录音末尾传来一声很轻的敲击，像隔着海面回应。沈砚舟关掉播放器，第一次没有立刻给出结论。" },
      { speaker: "沈砚舟", text: "这件事我会继续查。不是因为它危险——是因为这一次，我不想一个人做决定。" },
      { speaker: "叙述", text: "返程的车里雾渐渐变薄。你们没有谈那张值班表，但沉默和来时已经不同。" }
    ],
    reward: { affection: 12, flag: "scene_complete", message: "msg_after_scene" }
  }
};
