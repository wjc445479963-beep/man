import { encounters } from "../../data/companionship.js?v=0.3.0";

export class Conversation {
  constructor() { this.reset(); }
  reset() { this.id = null; this.nodeId = null; this.memory = {}; this.history = []; }
  get active() { return this.id !== null; }
  get encounter() { return encounters[this.id]; }
  get node() { return this.encounter?.nodes[this.nodeId]; }
  start(id) {
    if (!encounters[id]) return false;
    this.reset(); this.id = id; this.nodeId = "start";
    this.history.push({ speaker: "他", text: this.node.text });
    return true;
  }
  choose(index) {
    const choice = this.node?.choices?.[index];
    if (!choice || !this.encounter.nodes[choice.next]) return false;
    for (const key of ["mood", "preference"]) if (choice[key]) this.memory[key] = choice[key];
    this.history.push({ speaker: "你", text: choice.text });
    this.nodeId = choice.next;
    this.history.push({ speaker: "他", text: this.node.text });
    return true;
  }
  next() {
    if (!this.node?.next) return false;
    this.nodeId = this.node.next;
    this.history.push({ speaker: "他", text: this.node.text });
    return true;
  }
}
