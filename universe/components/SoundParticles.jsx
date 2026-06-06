"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Drifting sound fragments — not decoration: memories / sound grains orbiting
// the lifeform. Audio-reactive size + brightness.
const VERT = /* glsl */ `
uniform float uTime;
uniform float uAudio;
uniform float uPixelRatio;
attribute float aScale;
attribute float aSpeed;
varying float vA;
void main(){
  vec3 p = position;
  float ang = uTime * aSpeed * 0.2;
  mat2 r = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  p.xz = r * p.xz;
  p.y += sin(uTime * aSpeed + p.x) * 0.25;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aScale * (1.0 + uAudio * 1.6) * uPixelRatio * (260.0 / -mv.z);
  vA = 0.4 + uAudio * 0.6;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d) * vA;
  gl_FragColor = vec4(uColor, a);
}
`;

export default function SoundParticles({ audioRef, count = 1400, color = "#a78bfa" }) {
  const matRef = useRef();

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const speed = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const r = 3 + Math.pow(Math.random(), 0.6) * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      scale[i] = 0.6 + Math.random() * 2.4;
      speed[i] = 0.2 + Math.random() * 1.2;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudio: { value: 0 },
      uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1 },
      uColor: { value: new THREE.Color(color) },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useFrame((state, dt) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    const s = audioRef?.current ? audioRef.current.sample() : { level: 0 };
    u.uAudio.value += (s.level - u.uAudio.value) * Math.min(1, dt * 5);
    u.uColor.value.set(color);
  });

  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
