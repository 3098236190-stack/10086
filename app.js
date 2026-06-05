const palettes = [
  {
    name: "Aurora",
    colors: ["#0c1532", "#146c88", "#f4b35e", "#f44d76"],
    accent: "#8bf0c8",
    key: "C",
    scale: "major",
  },
  {
    name: "Citrus",
    colors: ["#11351f", "#35b76f", "#ffe26b", "#ff6f59"],
    accent: "#fff1a6",
    key: "D",
    scale: "lydian",
  },
  {
    name: "Coral",
    colors: ["#1d1b2f", "#e85d75", "#ffba6b", "#57c4e5"],
    accent: "#ffc9b7",
    key: "A",
    scale: "minor",
  },
  {
    name: "Lagoon",
    colors: ["#062f2f", "#0e9f8f", "#b4f06d", "#f45b69"],
    accent: "#bff7ef",
    key: "E",
    scale: "dorian",
  },
  {
    name: "Prism",
    colors: ["#171717", "#ff4f9a", "#5df2d6", "#ffe156"],
    accent: "#ffffff",
    key: "G",
    scale: "pentatonic",
  },
];

const promptIdeas = [
  "雨后城市，清亮，轻快",
  "霓虹海面，柔和，慢慢升温",
  "午后花园，明亮，跳动",
  "玻璃森林，空灵，有呼吸感",
  "星光公路，坚定，速度感",
  "暖色展厅，优雅，律动",
];

const scenePresets = {
  night: {
    palette: 4,
    prompt: "霓虹海面，柔和，慢慢升温",
    tempo: 104,
    energy: 72,
    density: 132,
    pull: 94,
    mode: "orbit",
  },
  rain: {
    palette: 0,
    prompt: "雨后城市，清亮，轻快",
    tempo: 92,
    energy: 62,
    density: 112,
    pull: 84,
    mode: "draw",
  },
  solar: {
    palette: 1,
    prompt: "午后花园，明亮，跳动",
    tempo: 118,
    energy: 82,
    density: 146,
    pull: 104,
    mode: "repel",
  },
  glass: {
    palette: 3,
    prompt: "玻璃森林，空灵，有呼吸感",
    tempo: 78,
    energy: 46,
    density: 92,
    pull: 72,
    mode: "orbit",
  },
};

const scaleSteps = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  minor: [0, 2, 3, 5, 7, 8, 10, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  lydian: [0, 2, 4, 6, 7, 9, 11, 12],
  pentatonic: [0, 2, 4, 7, 9, 12, 14, 16],
};

const keyMidi = { C: 60, D: 62, E: 64, F: 65, G: 67, A: 69, B: 71 };

const els = {
  canvas: document.querySelector("#particleCanvas"),
  paletteButtons: document.querySelector("#paletteButtons"),
  paletteName: document.querySelector("#paletteName"),
  flowSpeed: document.querySelector("#flowSpeed"),
  colorPower: document.querySelector("#colorPower"),
  musicPrompt: document.querySelector("#musicPrompt"),
  randomPrompt: document.querySelector("#randomPrompt"),
  autoMusic: document.querySelector("#autoMusic"),
  playToggle: document.querySelector("#playToggle"),
  playIcon: document.querySelector("#playIcon"),
  playLabel: document.querySelector("#playLabel"),
  generateMusic: document.querySelector("#generateMusic"),
  visualizer: document.querySelector("#visualizer"),
  sequenceGrid: document.querySelector("#sequenceGrid"),
  tempo: document.querySelector("#tempo"),
  energy: document.querySelector("#energy"),
  moodChip: document.querySelector("#moodChip"),
  tempoChip: document.querySelector("#tempoChip"),
  energyChip: document.querySelector("#energyChip"),
  particleDensity: document.querySelector("#particleDensity"),
  particlePull: document.querySelector("#particlePull"),
  burstParticles: document.querySelector("#burstParticles"),
};

const ctx = els.canvas.getContext("2d");
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false, down: false };
const state = {
  paletteIndex: 0,
  mode: "orbit",
  particles: [],
  composition: null,
  seed: Date.now(),
  playing: false,
  bars: [],
  sequenceDots: [],
};

let audio = null;
let schedulerId = null;
let nextStepTime = 0;
let stepIndex = 0;
let absoluteStep = 0;
let lastFrameTime = performance.now();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const rgb = value.match(/.{1,2}/g).map((part) => parseInt(part, 16));
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function choose(array, rng) {
  return array[Math.floor(rng() * array.length)];
}

function setupPalettes() {
  palettes.forEach((palette, index) => {
    const button = document.createElement("button");
    button.className = "swatch";
    button.type = "button";
    button.setAttribute("aria-label", palette.name);
    button.setAttribute("aria-pressed", index === state.paletteIndex ? "true" : "false");
    button.style.setProperty("--s1", palette.colors[0]);
    button.style.setProperty("--s2", palette.colors[1]);
    button.style.setProperty("--s3", palette.colors[2]);
    button.style.setProperty("--s4", palette.colors[3]);
    button.addEventListener("click", () => setPalette(index));
    els.paletteButtons.append(button);
  });
}

function setPalette(index) {
  state.paletteIndex = index;
  const palette = palettes[index];
  palette.colors.forEach((color, colorIndex) => {
    document.documentElement.style.setProperty(`--bg-${String.fromCharCode(97 + colorIndex)}`, color);
  });
  document.documentElement.style.setProperty("--accent", palette.accent);
  els.paletteName.textContent = palette.name;

  document.querySelectorAll(".swatch").forEach((button, buttonIndex) => {
    const isActive = buttonIndex === index;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  tintParticles();
  composeMusic(false);
}

function setParticleMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".mode-button").forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function updateBackgroundControls() {
  const speed = Number(els.flowSpeed.value);
  const power = Number(els.colorPower.value);
  document.documentElement.style.setProperty("--flow-duration", `${clamp(190 - speed, 58, 170) / 8}s`);
  document.documentElement.style.setProperty("--wash-alpha", (0.06 + power / 650).toFixed(3));
  document.documentElement.style.setProperty("--shade-opacity", (0.76 + power / 420).toFixed(3));
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  els.canvas.width = Math.floor(window.innerWidth * dpr);
  els.canvas.height = Math.floor(window.innerHeight * dpr);
  els.canvas.style.width = `${window.innerWidth}px`;
  els.canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  syncParticleCount();
}

function createParticle(rng = Math.random, fromPointer = false) {
  const palette = palettes[state.paletteIndex];
  const color = choose(palette.colors.concat(palette.accent), rng);
  const angle = rng() * Math.PI * 2;
  const speed = 0.18 + rng() * 0.72;
  return {
    x: fromPointer ? pointer.x + (rng() - 0.5) * 36 : rng() * window.innerWidth,
    y: fromPointer ? pointer.y + (rng() - 0.5) * 36 : rng() * window.innerHeight,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: 1.3 + rng() * 3.8,
    color,
    glow: palette.accent,
    phase: rng() * Math.PI * 2,
    life: fromPointer ? 90 + rng() * 90 : Infinity,
  };
}

// Ambient particles use life === Infinity and are governed by the density
// slider; burst particles are finite-life and live alongside them without
// being culled by the density target.
function syncParticleCount() {
  const target = Math.round(Number(els.particleDensity.value));
  let ambient = 0;
  for (let i = 0; i < state.particles.length; i += 1) {
    if (state.particles[i].life === Infinity) ambient += 1;
  }

  const rng = mulberry32(state.seed + target + state.paletteIndex * 97);
  while (ambient < target) {
    state.particles.push(createParticle(rng));
    ambient += 1;
  }
  while (ambient > target) {
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      if (state.particles[i].life === Infinity) {
        state.particles.splice(i, 1);
        ambient -= 1;
        break;
      }
    }
  }
}

function tintParticles() {
  const rng = mulberry32(state.seed + state.paletteIndex * 997);
  const palette = palettes[state.paletteIndex];
  state.particles.forEach((particle) => {
    particle.color = choose(palette.colors.concat(palette.accent), rng);
    particle.glow = palette.accent;
  });
}

function burst(count = 34) {
  const rng = mulberry32(hashString(`${state.seed}-${performance.now()}`));
  for (let i = 0; i < count; i += 1) {
    const particle = createParticle(rng, true);
    const angle = (i / count) * Math.PI * 2 + rng() * 0.2;
    const speed = 2 + rng() * 5.5;
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    particle.r += 1.4;
    state.particles.push(particle);
  }
}

function drawParticles(now) {
  const dt = Math.min(2.2, (now - lastFrameTime) / 16.67);
  lastFrameTime = now;
  const pull = Number(els.particlePull.value) / 100;
  const maxDistance = 210 * pull;
  const palette = palettes[state.paletteIndex];

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.globalCompositeOperation = "lighter";

  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const p = state.particles[i];
    const dx = pointer.x - p.x;
    const dy = pointer.y - p.y;
    const distance = Math.hypot(dx, dy) || 1;
    const influence = pointer.active ? clamp(1 - distance / maxDistance, 0, 1) : 0;

    if (influence > 0) {
      if (state.mode === "repel") {
        p.vx -= (dx / distance) * influence * 0.42 * pull;
        p.vy -= (dy / distance) * influence * 0.42 * pull;
      } else if (state.mode === "draw" || pointer.down) {
        p.vx += (dx / distance) * influence * 0.34 * pull;
        p.vy += (dy / distance) * influence * 0.34 * pull;
      } else {
        const tangentX = -dy / distance;
        const tangentY = dx / distance;
        p.vx += tangentX * influence * 0.24 * pull + (dx / distance) * influence * 0.05;
        p.vy += tangentY * influence * 0.24 * pull + (dy / distance) * influence * 0.05;
      }
    }

    p.phase += 0.025 * dt;
    p.vx += Math.cos(p.phase) * 0.008 * dt;
    p.vy += Math.sin(p.phase * 0.8) * 0.008 * dt;
    p.vx *= 0.988;
    p.vy *= 0.988;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (p.x < -24) p.x = window.innerWidth + 24;
    if (p.x > window.innerWidth + 24) p.x = -24;
    if (p.y < -24) p.y = window.innerHeight + 24;
    if (p.y > window.innerHeight + 24) p.y = -24;

    if (p.life !== Infinity) {
      p.life -= dt;
      if (p.life <= 0) {
        state.particles.splice(i, 1);
        continue;
      }
    }

    const alpha = p.life !== Infinity ? clamp(p.life / 80, 0, 0.75) : 0.62;
    const radius = p.r + Math.sin(p.phase) * 0.7 + influence * 3.6;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 5.2);
    gradient.addColorStop(0, hexToRgba(p.color, alpha));
    gradient.addColorStop(0.32, hexToRgba(p.glow, alpha * 0.36));
    gradient.addColorStop(1, hexToRgba(p.color, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius * 5.2, 0, Math.PI * 2);
    ctx.fill();

    if (influence > 0.34) {
      ctx.strokeStyle = hexToRgba(palette.accent, influence * 0.16);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();
    }
  }

  ctx.globalCompositeOperation = "source-over";
  syncParticleCount();
  requestAnimationFrame(drawParticles);
}

function setupVisualizer() {
  for (let i = 0; i < 24; i += 1) {
    const bar = document.createElement("span");
    bar.className = "bar";
    bar.style.setProperty("--h", `${22 + Math.sin(i * 1.7) * 13 + (i % 7) * 7}%`);
    bar.style.setProperty("--d", `${560 + (i % 6) * 120}ms`);
    bar.style.setProperty("--delay", `${i * 34}ms`);
    els.visualizer.append(bar);
    state.bars.push(bar);
  }

  for (let i = 0; i < 16; i += 1) {
    const dot = document.createElement("span");
    dot.className = "sequence-dot";
    els.sequenceGrid.append(dot);
    state.sequenceDots.push(dot);
  }
}

function composeMusic(forceNewSeed = true) {
  if (forceNewSeed) state.seed = Date.now() ^ hashString(els.musicPrompt.value);
  const prompt = els.musicPrompt.value.trim() || "flow";
  const palette = palettes[state.paletteIndex];
  const rng = mulberry32(hashString(`${prompt}-${state.seed}-${palette.name}`));
  const scaleNames = Object.keys(scaleSteps);
  const scale = prompt.includes("空灵") || prompt.includes("星") ? "lydian" : prompt.includes("坚定") ? "dorian" : palette.scale;
  const pickedScale = rng() > 0.72 ? choose(scaleNames, rng) : scale;
  const key = rng() > 0.8 ? choose(Object.keys(keyMidi), rng) : palette.key;
  const root = keyMidi[key] + (rng() > 0.55 ? 0 : -12);
  const steps = scaleSteps[pickedScale];
  const chordRoots = [0, 3, 4, 2].map((base) => steps[base % steps.length]);
  const melody = Array.from({ length: 16 }, (_, index) => {
    if (rng() < 0.24 && index % 4 !== 0) return null;
    return steps[Math.floor(rng() * steps.length)] + (rng() > 0.58 ? 12 : 0);
  });
  const hats = Array.from({ length: 16 }, (_, index) => rng() > (index % 4 === 0 ? 0.24 : 0.48));

  state.composition = {
    key,
    scale: pickedScale,
    root,
    steps,
    chordRoots,
    melody,
    hats,
    wave: rng() > 0.48 ? "triangle" : "sine",
    sparkle: rng() > 0.5,
  };
  updateStatus();
  animateVisualizerPattern();
  updateSequenceGrid();
}

function updateStatus() {
  const composition = state.composition;
  els.moodChip.textContent = `${palettes[state.paletteIndex].name} / ${composition.key} ${composition.scale}`;
  els.tempoChip.textContent = `${els.tempo.value} BPM`;
  els.energyChip.textContent = `Energy ${els.energy.value}%`;
}

function animateVisualizerPattern() {
  const rng = mulberry32(state.seed + hashString(els.musicPrompt.value));
  state.bars.forEach((bar, index) => {
    const height = 16 + rng() * 70 + Math.sin(index * 0.6) * 12;
    bar.style.setProperty("--h", `${clamp(height, 10, 96)}%`);
    bar.style.setProperty("--d", `${520 + rng() * 780}ms`);
  });
}

function updateSequenceGrid(activeIndex = -1) {
  if (!state.composition) return;
  state.sequenceDots.forEach((dot, index) => {
    const hasMelody = state.composition.melody[index] !== null;
    const hasHat = state.composition.hats[index];
    dot.classList.toggle("on", hasMelody || hasHat || index % 4 === 0);
    dot.classList.toggle("active", index === activeIndex);
    dot.style.opacity = hasMelody ? "1" : hasHat ? "0.74" : "0.38";
  });
}

function ensureAudio() {
  if (audio) return audio;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContext();
  const master = context.createGain();
  const delay = context.createDelay(0.5);
  const delayGain = context.createGain();
  const filter = context.createBiquadFilter();

  master.gain.value = 0.7;
  filter.type = "lowpass";
  filter.frequency.value = 5200;
  filter.Q.value = 0.55;
  delay.delayTime.value = 0.18;
  delayGain.gain.value = 0.16;

  master.connect(filter);
  filter.connect(context.destination);
  filter.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(filter);

  audio = { context, master, filter };
  return audio;
}

function envelope(gain, time, peak, attack, decay, sustain, release) {
  gain.gain.cancelScheduledValues(time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), time + attack);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, sustain), time + attack + decay);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay + release);
}

function playTone(midi, time, duration, options = {}) {
  const { context, master } = ensureAudio();
  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const energy = Number(els.energy.value) / 100;

  osc.type = options.wave || state.composition.wave;
  osc.frequency.setValueAtTime(midiToFreq(midi), time);
  if (options.detune) osc.detune.setValueAtTime(options.detune, time);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(options.cutoff || 1400 + energy * 4200, time);
  filter.Q.value = options.q || 1.2;

  envelope(gain, time, options.peak || 0.08, options.attack || 0.012, options.decay || 0.08, options.sustain || 0.028, options.release || duration);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  osc.start(time);
  osc.stop(time + duration + 0.8);
}

function playPad(rootMidi, time, duration) {
  const chord = [0, 4, 7].map((offset, index) => rootMidi + offset + (index === 2 ? 12 : 0));
  chord.forEach((midi, index) => {
    playTone(midi, time + index * 0.012, duration, {
      wave: "sine",
      peak: 0.034,
      attack: 0.28,
      decay: 0.32,
      sustain: 0.018,
      release: duration + 0.42,
      cutoff: 1200,
      detune: index * 4 - 4,
    });
  });
}

function playKick(time) {
  const { context, master } = ensureAudio();
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, time);
  osc.frequency.exponentialRampToValueAtTime(38, time + 0.18);
  envelope(gain, time, 0.3, 0.006, 0.04, 0.12, 0.14);
  osc.connect(gain);
  gain.connect(master);
  osc.start(time);
  osc.stop(time + 0.28);
}

function playHat(time) {
  const { context, master } = ensureAudio();
  const bufferSize = context.sampleRate * 0.06;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;

  const source = context.createBufferSource();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = 6500;
  envelope(gain, time, 0.045, 0.003, 0.012, 0.018, 0.035);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(time);
}

function scheduleStep(time, index) {
  if (index > 0 && index % 32 === 0 && els.autoMusic.checked) {
    composeMusic(true);
    burst(14);
  }

  const composition = state.composition;
  const stepDuration = 60 / Number(els.tempo.value) / 2;
  const energy = Number(els.energy.value) / 100;
  const chordRoot = composition.root + composition.chordRoots[Math.floor((index % 16) / 4)];
  const melodyStep = composition.melody[index % composition.melody.length];

  if (index % 8 === 0) playPad(chordRoot - 12, time, stepDuration * 7.6);
  if (index % 4 === 0) playKick(time);
  if (composition.hats[index % 16] && energy > 0.34) playHat(time + stepDuration * 0.04);

  if (index % 2 === 0) {
    playTone(chordRoot - 24, time, stepDuration * 0.8, {
      wave: "triangle",
      peak: 0.05 + energy * 0.06,
      attack: 0.01,
      decay: 0.06,
      sustain: 0.022,
      release: 0.18,
      cutoff: 700 + energy * 1400,
    });
  }

  if (melodyStep !== null && (energy > 0.42 || index % 2 === 0)) {
    playTone(composition.root + melodyStep + 12, time + stepDuration * 0.02, stepDuration * 0.72, {
      peak: 0.044 + energy * 0.05,
      attack: 0.01,
      decay: 0.05,
      sustain: 0.02,
      release: 0.2,
      cutoff: 1700 + energy * 4200,
    });
  }

  window.setTimeout(() => {
    if (state.playing) updateSequenceGrid(index % 16);
  }, Math.max(0, (time - ensureAudio().context.currentTime) * 1000));
}

function schedulerTick() {
  const { context } = ensureAudio();
  const lookAhead = 0.16;
  while (nextStepTime < context.currentTime + lookAhead) {
    scheduleStep(nextStepTime, absoluteStep);
    nextStepTime += 60 / Number(els.tempo.value) / 2;
    stepIndex = (stepIndex + 1) % 16;
    absoluteStep += 1;
  }
}

async function startMusic() {
  const { context } = ensureAudio();
  if (context.state === "suspended") await context.resume();
  state.playing = true;
  document.body.classList.add("playing");
  els.playIcon.textContent = "Ⅱ";
  els.playLabel.textContent = "暂停";
  els.playToggle.setAttribute("aria-pressed", "true");
  nextStepTime = context.currentTime + 0.04;
  stepIndex = 0;
  absoluteStep = 0;
  schedulerId = window.setInterval(schedulerTick, 48);
  burst(22);
}

function stopMusic() {
  state.playing = false;
  document.body.classList.remove("playing");
  els.playIcon.textContent = "▶";
  els.playLabel.textContent = "播放";
  els.playToggle.setAttribute("aria-pressed", "false");
  if (schedulerId) window.clearInterval(schedulerId);
  schedulerId = null;
  updateSequenceGrid();
}

function bindEvents() {
  window.addEventListener("resize", resizeCanvas);

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    document.documentElement.style.setProperty("--mx", `${(event.clientX / window.innerWidth) * 100}%`);
    document.documentElement.style.setProperty("--my", `${(event.clientY / window.innerHeight) * 100}%`);
  });

  window.addEventListener("pointerdown", (event) => {
    pointer.down = true;
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    burst(28);
  });

  window.addEventListener("pointerup", () => {
    pointer.down = false;
  });

  window.addEventListener("pointercancel", () => {
    pointer.down = false;
    pointer.active = false;
  });

  window.addEventListener("pointerleave", () => {
    pointer.active = false;
    pointer.down = false;
  });

  els.flowSpeed.addEventListener("input", updateBackgroundControls);
  els.colorPower.addEventListener("input", updateBackgroundControls);
  els.particleDensity.addEventListener("input", syncParticleCount);
  els.particlePull.addEventListener("change", () => burst(10));
  els.burstParticles.addEventListener("click", () => burst(52));

  els.tempo.addEventListener("input", updateStatus);
  els.energy.addEventListener("input", () => {
    updateStatus();
    animateVisualizerPattern();
    if (audio) audio.filter.frequency.setTargetAtTime(2400 + Number(els.energy.value) * 56, audio.context.currentTime, 0.08);
  });

  els.randomPrompt.addEventListener("click", () => {
    const current = els.musicPrompt.value;
    const choices = promptIdeas.filter((idea) => idea !== current);
    els.musicPrompt.value = choose(choices, Math.random);
    composeMusic(true);
    burst(18);
  });

  els.musicPrompt.addEventListener("change", () => composeMusic(true));

  els.generateMusic.addEventListener("click", () => {
    composeMusic(true);
    burst(26);
  });

  els.playToggle.addEventListener("click", () => {
    if (state.playing) stopMusic();
    else startMusic();
  });

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      setParticleMode(button.dataset.mode);
      burst(18);
    });
  });

  document.querySelectorAll(".scene-card").forEach((button) => {
    button.addEventListener("click", () => {
      applyScene(button.dataset.scene);
    });
  });
}

function applyScene(sceneId) {
  const scene = scenePresets[sceneId];
  if (!scene) return;

  els.musicPrompt.value = scene.prompt;
  els.tempo.value = scene.tempo;
  els.energy.value = scene.energy;
  els.particleDensity.value = scene.density;
  els.particlePull.value = scene.pull;
  setParticleMode(scene.mode);
  setPalette(scene.palette);
  updateBackgroundControls();
  syncParticleCount();
  composeMusic(true);
  burst(38);

  document.querySelectorAll(".scene-card").forEach((button) => {
    const isActive = button.dataset.scene === sceneId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function init() {
  setupPalettes();
  setupVisualizer();
  bindEvents();
  resizeCanvas();
  updateBackgroundControls();
  applyScene("night");
  requestAnimationFrame(drawParticles);
}

init();
