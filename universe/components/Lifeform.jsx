"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Ashima 3D simplex noise — drives the breathing / morphing displacement.
const SNOISE = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERT = /* glsl */ `
uniform float uTime;
uniform float uAudio;
uniform float uSpikes;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vDisp;
${SNOISE}
void main(){
  vec3 pos = position;
  float n  = snoise(normal * 1.3 + uTime * 0.22);
  float n2 = snoise(normal * 3.1 - uTime * 0.4);
  float disp = (n * 0.5 + n2 * 0.28) * (0.16 + uSpikes * 0.5) * (0.6 + uAudio * 1.6);
  pos += normal * disp;
  vDisp = disp;
  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vWorld = wp.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uAudio;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vDisp;
void main(){
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(dot(normalize(vNormal), V), 0.0), 2.2);
  vec3 col = mix(uColorA, uColorB, fres);
  col += max(vDisp, 0.0) * 1.8 * uColorB;
  float alpha = clamp(fres * 0.9 + 0.10 + uAudio * 0.25, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`;

export default function Lifeform({ audioRef, hue = 0.72, spikes = 0.4 }) {
  const matRef = useRef();
  const coreRef = useRef();
  const groupRef = useRef();
  const target = useRef({ audio: 0, spikes });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudio: { value: 0 },
      uSpikes: { value: spikes },
      uColorA: { value: new THREE.Color().setHSL(hue, 0.7, 0.55) },
      uColorB: { value: new THREE.Color().setHSL((hue + 0.12) % 1, 0.9, 0.75) },
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const s = audioRef?.current ? audioRef.current.sample() : { level: 0, bass: 0 };
    // smooth the audio level
    target.current.audio += (s.level - target.current.audio) * Math.min(1, dt * 6);
    const lvl = target.current.audio;

    if (matRef.current) {
      const u = matRef.current.uniforms;
      u.uTime.value = t;
      u.uAudio.value = lvl + s.bass * 0.4;
      u.uSpikes.value += (spikes - u.uSpikes.value) * Math.min(1, dt * 3);
      u.uColorA.value.setHSL(hue, 0.7, 0.5 + lvl * 0.1);
      u.uColorB.value.setHSL((hue + 0.12) % 1, 0.9, 0.72);
    }
    if (coreRef.current) {
      const sc = 0.5 + lvl * 0.5 + 0.05 * Math.sin(t * 1.6);
      coreRef.current.scale.setScalar(sc);
      coreRef.current.material.opacity = 0.5 + lvl * 0.5;
      coreRef.current.material.color.setHSL((hue + 0.1) % 1, 0.6, 0.85);
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * (0.12 + lvl * 0.3);
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.18;
      // breathing idle float
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.35, 48]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
