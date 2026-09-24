export class AmbientAudio {
  constructor() { this.enabled = false; this.onVisibility = () => { if (!this.context) return; if (document.hidden) this.context.suspend(); else if (this.enabled) this.context.resume().catch(() => {}); }; document.addEventListener("visibilitychange", this.onVisibility); }
  async toggle() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error("这个浏览器暂不支持雨声");
      this.context = new AudioContext();
      const buffer = this.context.createBuffer(1, this.context.sampleRate * 4, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.source = this.context.createBufferSource(); this.source.buffer = buffer; this.source.loop = true;
      this.filter = this.context.createBiquadFilter(); this.filter.type = "lowpass"; this.filter.frequency.value = 1200;
      this.volume = this.context.createGain(); this.volume.gain.value = 0;
      this.source.connect(this.filter).connect(this.volume).connect(this.context.destination); this.source.start();
    }
    this.enabled = !this.enabled;
    if (this.enabled) await this.context.resume();
    this.volume.gain.setTargetAtTime(this.enabled ? .09 : 0, this.context.currentTime, .35);
    return this.enabled;
  }
}
