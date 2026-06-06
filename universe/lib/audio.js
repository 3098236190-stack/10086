// Compact generative audio engine with an analyser the 3D lifeform reads from.
// Each "genre" reshapes tempo, scale, timbre and drum feel, so the music can
// visibly change the creature's form.

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  minor: [0, 2, 3, 5, 7, 8, 10, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  lydian: [0, 2, 4, 6, 7, 9, 11, 12],
  penta: [0, 2, 4, 7, 9, 12, 14, 16],
};

// Genres inspired by common AI-music styles (Suno-style tags). Each maps to
// tempo / scale / timbre / drum feel, plus the lifeform's hue + spikiness.
export const GENRES = {
  lofi: { zh: "Lo-Fi", tempo: 84, scale: "minor", wave: "triangle", kickEvery: 4, spikes: 0.35, hue: 0.72 },
  pop: { zh: "流行", tempo: 114, scale: "major", wave: "triangle", kickEvery: 4, spikes: 0.5, hue: 0.55 },
  edm: { zh: "电子", tempo: 128, scale: "major", wave: "sawtooth", kickEvery: 4, spikes: 0.8, hue: 0.58 },
  house: { zh: "浩室", tempo: 124, scale: "minor", wave: "sawtooth", kickEvery: 4, spikes: 0.62, hue: 0.52 },
  synthwave: { zh: "合成波", tempo: 100, scale: "minor", wave: "sawtooth", kickEvery: 4, spikes: 0.66, hue: 0.83 },
  hiphop: { zh: "嘻哈", tempo: 90, scale: "minor", wave: "triangle", kickEvery: 8, spikes: 0.45, hue: 0.08 },
  trap: { zh: "Trap", tempo: 140, scale: "minor", wave: "sawtooth", kickEvery: 8, spikes: 0.72, hue: 0.78 },
  rock: { zh: "摇滚", tempo: 132, scale: "minor", wave: "sawtooth", kickEvery: 4, spikes: 0.9, hue: 0.0 },
  funk: { zh: "放克", tempo: 112, scale: "dorian", wave: "sawtooth", kickEvery: 4, spikes: 0.6, hue: 0.1 },
  jazz: { zh: "爵士", tempo: 108, scale: "dorian", wave: "sine", kickEvery: 8, spikes: 0.32, hue: 0.13 },
  folk: { zh: "民谣", tempo: 96, scale: "major", wave: "triangle", kickEvery: 8, spikes: 0.34, hue: 0.33 },
  epic: { zh: "史诗", tempo: 128, scale: "minor", wave: "sawtooth", kickEvery: 2, spikes: 1.0, hue: 0.86 },
  classical: { zh: "古典", tempo: 96, scale: "major", wave: "sine", kickEvery: 8, spikes: 0.4, hue: 0.62 },
  ambient: { zh: "氛围", tempo: 60, scale: "lydian", wave: "sine", kickEvery: 16, spikes: 0.14, hue: 0.48 },
  healing: { zh: "治愈", tempo: 66, scale: "lydian", wave: "sine", kickEvery: 16, spikes: 0.18, hue: 0.5 },
};

const KEY = 60; // middle C

function midiToFreq(m) {
  return 440 * 2 ** ((m - 69) / 12);
}

export function createAudioEngine() {
  let ctx = null;
  let master = null;
  let analyser = null;
  let data = null;
  let timer = null;
  let step = 0;
  let genre = "lofi";
  let playing = false;
  let streamDest = null;
  let recorder = null;
  let chunks = [];
  let capturing = false;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 6000;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.82;
    master.connect(filter);
    filter.connect(analyser);
    analyser.connect(ctx.destination);
    // Tap for recording / export.
    streamDest = ctx.createMediaStreamDestination();
    filter.connect(streamDest);
    data = new Uint8Array(analyser.frequencyBinCount);
  }

  function env(gain, t, peak, a, d, s, r) {
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, s), t + a + d);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + a + d + r);
  }

  function tone(midi, t, dur, opts = {}) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.wave || "sine";
    osc.frequency.setValueAtTime(midiToFreq(midi), t);
    if (opts.detune) osc.detune.setValueAtTime(opts.detune, t);
    env(g, t, opts.peak || 0.08, opts.a || 0.01, opts.d || 0.08, opts.s || 0.02, opts.r || dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.6);
  }

  function kick(t) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.16);
    env(g, t, 0.32, 0.005, 0.04, 0.1, 0.14);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  function pad(rootMidi, t, dur, wave) {
    [0, 4, 7, 12].forEach((o, i) => {
      tone(rootMidi + o, t + i * 0.01, dur, {
        wave: wave === "sawtooth" ? "sawtooth" : "sine",
        peak: 0.03,
        a: 0.3,
        d: 0.4,
        s: 0.016,
        r: dur + 0.5,
        detune: i * 4 - 4,
      });
    });
  }

  function tick() {
    const g = GENRES[genre];
    const scale = SCALES[g.scale];
    const stepDur = 60 / g.tempo / 2;
    const t = ctx.currentTime + 0.05;
    const i = step % 16;
    if (i % 8 === 0) pad(KEY - 12 + scale[(step / 8) % scale.length | 0], t, stepDur * 7, g.wave);
    if (g.kickEvery && step % g.kickEvery === 0) kick(t);
    if (step % 2 === 0) {
      const n = scale[Math.floor(Math.random() * scale.length)];
      tone(KEY + n + 12, t, stepDur * 0.7, {
        wave: g.wave,
        peak: 0.05,
        a: 0.01,
        d: 0.05,
        s: 0.02,
        r: 0.2,
      });
    }
    step += 1;
  }

  return {
    isPlaying: () => playing,
    genre: () => genre,
    setGenre(id) {
      if (GENRES[id]) genre = id;
    },
    async start() {
      ensure();
      if (ctx.state === "suspended") await ctx.resume();
      if (playing) return;
      playing = true;
      step = 0;
      const loop = () => {
        if (!playing) return;
        tick();
        const g = GENRES[genre];
        timer = window.setTimeout(loop, (60 / g.tempo / 2) * 1000);
      };
      loop();
    },
    stop() {
      playing = false;
      if (timer) window.clearTimeout(timer);
      timer = null;
    },
    isCapturing: () => capturing,
    // Record the live output; resolves on stopCapture with a downloadable Blob.
    startCapture() {
      ensure();
      if (capturing) return;
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(
        (m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m),
      );
      chunks = [];
      recorder = new MediaRecorder(streamDest.stream, mime ? { mimeType: mime } : undefined);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.start();
      capturing = true;
    },
    stopCapture() {
      return new Promise((resolve) => {
        if (!recorder) {
          resolve(null);
          return;
        }
        recorder.onstop = () => {
          capturing = false;
          resolve(new Blob(chunks, { type: chunks[0] ? chunks[0].type : "audio/webm" }));
        };
        recorder.stop();
      });
    },
    // Returns { level, bass, treble } in 0..1 for the current frame.
    sample() {
      if (!analyser) return { level: 0, bass: 0, treble: 0 };
      analyser.getByteFrequencyData(data);
      const n = data.length;
      let sum = 0;
      let bass = 0;
      let treble = 0;
      for (let i = 0; i < n; i += 1) {
        sum += data[i];
        if (i < n * 0.25) bass += data[i];
        if (i > n * 0.7) treble += data[i];
      }
      return {
        level: sum / (n * 255),
        bass: bass / (n * 0.25 * 255),
        treble: treble / (n * 0.3 * 255),
      };
    },
  };
}
