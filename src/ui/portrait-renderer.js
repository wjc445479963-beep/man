// Image-space deformation animates head and chest independently of the room.
const vertexSource = `attribute vec2 aPosition;
varying vec2 vUv;
void main(){gl_Position=vec4(aPosition,0.,1.);vUv=vec2((aPosition.x+1.)*.5,(1.-aPosition.y)*.5);}`;
const fragmentSource = `precision mediump float;
varying vec2 vUv;
uniform sampler2D uBase; uniform sampler2D uClosed; uniform sampler2D uSmile;
uniform float uTime; uniform float uBlink; uniform float uWarm; uniform float uReaction;
uniform vec2 uPointer; uniform vec3 uGesture;
float area(vec2 p,vec2 c,vec2 r){vec2 d=(p-c)/r;return exp(-dot(d,d)*2.);}
void main(){
vec2 uv=vUv;float head=area(uv,vec2(.43,.135),vec2(.24,.16));float chest=area(uv,vec2(.49,.38),vec2(.34,.24));
uv.x-=head*(uPointer.x*.0025+sin(uTime*.55)*.0006+uReaction*.0015);
uv.y-=chest*sin(uTime*1.35)*.0012+head*(sin(uTime*1.35)*.00055+uPointer.y*.001+uReaction*.0012);
uv.x-=head*(uv.y-.21)*uGesture.x*.035;
uv.y-=head*uGesture.x*.0025+area(uv,vec2(.245,.57),vec2(.2,.17))*uGesture.y*.004+chest*uGesture.z*.001;
vec4 color=texture2D(uBase,uv);
float face=1.-smoothstep(.62,1.,length((uv-vec2(.45,.167))/vec2(.16,.094)));
color=mix(color,texture2D(uSmile,uv),uWarm*face);
float eyes=1.-smoothstep(.60,1.,length((uv-vec2(.47,.129))/vec2(.145,.060)));
gl_FragColor=mix(color,texture2D(uClosed,uv),uBlink*eyes);}`;

function loadImage(src) {
  return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
}

export class PortraitRenderer {
  constructor(canvas, media) {
    this.canvas = canvas; this.media = media; this.pointer = [0, 0]; this.targetPointer = [0, 0];
    this.warm = 0; this.targetWarm = 0; this.reactionAt = -10000; this.nextBlink = performance.now() + 3500; this.blinkDuration = 180;
    this.gesture = [0, 0, 0]; this.targetGesture = [0, 0, 0];
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.onVisibility = () => { if (document.hidden) cancelAnimationFrame(this.frame); else this.start(); };
    document.addEventListener("visibilitychange", this.onVisibility);
    this.ready = this.init();
  }
  async init() {
    try {
      const base = await loadImage(this.media.portrait);
      const variants = await Promise.all([this.media.blink, this.media.smile].map(src => loadImage(src).catch(() => base)));
      if (this.disposed) return;
      const gl = this.canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
      if (!gl) throw new Error("WebGL unavailable");
      this.gl = gl;
      const compile = (type, source) => {
        const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
        return shader;
      };
      this.program = gl.createProgram();
      this.shaders = [compile(gl.VERTEX_SHADER, vertexSource), compile(gl.FRAGMENT_SHADER, fragmentSource)];
      this.shaders.forEach(shader => gl.attachShader(this.program, shader)); gl.linkProgram(this.program);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error("Portrait shader link failed");
      gl.useProgram(this.program);
      this.buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(this.program, "aPosition"); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      this.textures = [base, ...variants].map((image, index) => {
        const texture = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + index); gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.uniform1i(gl.getUniformLocation(this.program, ["uBase", "uClosed", "uSmile"][index]), index);
        return texture;
      });
      this.uniforms = Object.fromEntries(["uTime", "uBlink", "uWarm", "uReaction", "uPointer", "uGesture"].map(name => [name, gl.getUniformLocation(this.program, name)]));
      this.resize = new ResizeObserver(() => this.setSize()); this.resize.observe(this.canvas); this.setSize();
      this.canvas.dataset.renderer = "animated"; this.canvas.style.opacity = "1";
      this.onLoss = event => { event.preventDefault(); cancelAnimationFrame(this.frame); this.canvas.style.opacity = "0"; this.canvas.dataset.renderer = "fallback"; };
      this.canvas.addEventListener("webglcontextlost", this.onLoss); this.start();
    } catch (error) {
      this.canvas.dataset.renderer = "fallback"; this.canvas.style.opacity = "0";
      console.warn("Using static portrait fallback:", error.message || "asset unavailable");
    }
  }
  setSize() {
    const width = Math.max(1, Math.min(941, Math.round(this.canvas.clientWidth * Math.min(devicePixelRatio || 1, 1.5))));
    this.canvas.width = width; this.canvas.height = Math.round(width * 1672 / 941);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    if (this.reduced) this.draw(performance.now());
  }
  setExpression(face, gesture) { this.targetWarm = face === "amused" ? 1 : face === "soft" ? .35 : 0; this.targetGesture = [gesture === "hair" ? 1 : 0, gesture === "hand" ? 1 : 0, gesture === "lapel" ? 1 : 0]; this.reactionAt = performance.now(); if (face === "soft") { this.nextBlink = performance.now() + 200; this.blinkDuration = 650; } if (this.reduced && this.gl) this.draw(performance.now()); }
  lookAt(x, y) { this.targetPointer = [Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y))]; }
  start() { cancelAnimationFrame(this.frame); if (!this.gl || this.disposed || document.hidden) return; this.draw(performance.now()); }
  draw(now) {
    if (this.disposed || document.hidden || this.gl.isContextLost()) return;
    if (!this.reduced && now - (this.lastFrame || 0) < 32) { this.frame = requestAnimationFrame(time => this.draw(time)); return; }
    this.lastFrame = now;
    const gl = this.gl;
    if (now >= this.nextBlink + this.blinkDuration) { this.nextBlink = now + 3200 + Math.random() * 3700; this.blinkDuration = 180; }
    const blinkTime = (now - this.nextBlink) / this.blinkDuration;
    const blink = !this.reduced && blinkTime >= 0 && blinkTime <= 1 ? Math.sin(Math.PI * blinkTime) : 0;
    this.warm += (this.targetWarm - this.warm) * (this.reduced ? 1 : .09);
    this.pointer = this.pointer.map((value, i) => value + (this.targetPointer[i] - value) * .06);
    this.gesture = this.gesture.map((value, i) => value + (this.targetGesture[i] - value) * .045);
    gl.uniform1f(this.uniforms.uTime, this.reduced ? 0 : now / 1000);
    gl.uniform1f(this.uniforms.uBlink, blink); gl.uniform1f(this.uniforms.uWarm, this.warm);
    gl.uniform1f(this.uniforms.uReaction, this.reduced ? 0 : Math.exp(-Math.max(0, now - this.reactionAt) / 600));
    gl.uniform2fv(this.uniforms.uPointer, this.reduced ? [0, 0] : this.pointer);
    gl.uniform3fv(this.uniforms.uGesture, this.reduced ? [0, 0, 0] : this.gesture); gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (!this.reduced) this.frame = requestAnimationFrame(time => this.draw(time));
  }
  dispose() {
    this.disposed = true; cancelAnimationFrame(this.frame); this.resize?.disconnect(); document.removeEventListener("visibilitychange", this.onVisibility);
    if (this.onLoss) this.canvas.removeEventListener("webglcontextlost", this.onLoss);
    if (this.gl) { this.textures?.forEach(texture => this.gl.deleteTexture(texture)); this.shaders?.forEach(shader => this.gl.deleteShader(shader)); this.gl.deleteBuffer(this.buffer); this.gl.deleteProgram(this.program); }
  }
}
