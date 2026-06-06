# 流光 · Sound Universe

An audio-reactive **3D digital lifeform** and a small explorable **sound universe** —
not a SaaS landing page, a world you enter.

## Stack
- **Next.js** (App Router) · **React Three Fiber** · **Three.js**
- **@react-three/drei** (OrbitControls, Html) · **@react-three/postprocessing** (Bloom, Vignette)
- Custom **ShaderMaterial** (simplex-noise displacement + fresnel glow) for the lifeform
- **GSAP** (cinematic camera push-in) · **Framer Motion** (poetic intro + HUD) · **Leva** (live tuning)
- **Web Audio API** generative engine + `AnalyserNode` driving the shaders

## The world
- **中心 / Center — 流光生命体 (Lifeform):** a semi-transparent energy being. Breathes,
  floats, follows the camera, reacts to clicks, and **changes form with music style**
  (genre → color hue + spikiness). Frequency data feeds the displacement shader.
- **左 / Left — 音乐实验室 (Music Lab):** a light-bar equalizer dancing to the audio.
- **右 / Right — 记忆花园 (Memory Garden):** luminous memory orbs, gently bobbing.
- **后 / Behind — 声音神殿 (Sound Temple):** a ring of glowing pillars rising with the bass.

Orbit the camera (drag) to discover each zone. Pick a genre to morph the being.

## Run
```bash
cd universe
npm install
npm run dev     # http://localhost:3000
# production:
npm run build && npm run start
```

> Audio starts on “进入 · Enter” (browsers require a user gesture).
> Respects `prefers-reduced-motion`.
