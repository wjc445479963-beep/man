import { PortraitRenderer } from "./portrait-renderer.js?v=0.3.0";
import { escapeHtml } from "./html.js?v=0.3.0";

export class CharacterStage {
  constructor(root, onTouch) { this.root = root; this.onTouch = onTouch; }
  render(character) {
    this.media = character.presentation;
    this.root.innerHTML = `<div class="presence-background" style="background-image:url('${this.media.portrait}')"></div>
      <div class="portrait-plane"><img class="portrait-fallback" src="${this.media.portrait}" alt="${escapeHtml(character.name)}，坐在窗边等你" draggable="false">
      <canvas class="living-portrait" aria-hidden="true"></canvas><div class="portrait-guides" aria-hidden="true">${this.media.zones.map(zone => `<span style="left:${zone.x * 100}%;top:${zone.y * 100}%">${zone.label}</span>`).join("")}</div></div>
      <div class="presence-vignette"></div><div class="rain-light" aria-hidden="true"></div>
      <span class="touch-ripple" aria-hidden="true"></span>`;
    this.plane = this.root.querySelector(".portrait-plane");
    this.renderer = new PortraitRenderer(this.root.querySelector("canvas"), this.media);
    this.abort = new AbortController();
    const options = { signal: this.abort.signal };
    this.root.addEventListener("pointermove", event => {
      if (event.pointerType === "touch") return;
      const rect = this.plane.getBoundingClientRect();
      this.renderer.lookAt((event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1);
    }, options);
    this.root.addEventListener("pointerleave", () => this.renderer.lookAt(0, 0), options);
    this.root.addEventListener("pointerdown", event => { this.pointerStart = { x: event.clientX, y: event.clientY }; }, options);
    this.root.addEventListener("pointerup", event => {
      if (!this.pointerStart || Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y) > 12) return;
      const zone = this.hitTest(event.clientX, event.clientY); this.pointerStart = null;
      if (!zone) return;
      const rect = this.root.getBoundingClientRect(), ripple = this.root.querySelector(".touch-ripple");
      ripple.style.left = `${event.clientX - rect.left}px`; ripple.style.top = `${event.clientY - rect.top}px`;
      ripple.getAnimations().forEach(animation => animation.cancel());
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) ripple.animate([{ opacity: .9, transform: "translate(-50%,-50%) scale(.3)" }, { opacity: 0, transform: "translate(-50%,-50%) scale(2.5)" }], { duration: 700 });
      this.onTouch?.(zone.id);
    }, options);
    this.root.addEventListener("pointercancel", () => { this.pointerStart = null; }, options);
  }
  hitTest(clientX, clientY) {
    const rect = this.plane.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width, y = (clientY - rect.top) / rect.height;
    return this.media.zones.find(zone => ((x - zone.x) / zone.rx) ** 2 + ((y - zone.y) / zone.ry) ** 2 <= 1);
  }
  react(face, gesture) { this.renderer?.setExpression(face, gesture); }
  toggleGuides() { return this.root.classList.toggle("show-guides"); }
  toggleClose() { return this.root.classList.toggle("camera-close"); }
  dispose() { this.abort?.abort(); this.renderer?.dispose(); }
}
