"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

function ZoneLabel({ title, sub }) {
  return (
    <Html center distanceFactor={14} pointerEvents="none">
      <div className="zone-label">
        <strong>{title}</strong>
        <span>{sub}</span>
      </div>
    </Html>
  );
}

// 左 · 音乐实验室 — a floating equalizer of light bars that dance to the audio.
export function MusicLab({ audioRef, position = [-8, 0, 0] }) {
  const group = useRef();
  const bars = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);
  useFrame((state, dt) => {
    const s = audioRef?.current ? audioRef.current.sample() : { level: 0, treble: 0 };
    group.current.children.forEach((b, i) => {
      if (!b.scale) return;
      const target = 0.4 + (0.6 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.5) * (0.4 + s.level * 3.2);
      b.scale.y += (target - b.scale.y) * Math.min(1, dt * 8);
    });
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.25;
  });
  return (
    <group position={position}>
      <group ref={group}>
        {bars.map((i) => (
          <mesh key={i} position={[(i - 7.5) * 0.34, 0, 0]}>
            <boxGeometry args={[0.18, 2, 0.18]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={1.05}
              toneMapped={false}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
      <ZoneLabel title="音乐实验室" sub="Music Lab" />
    </group>
  );
}

// 右 · 记忆花园 — luminous memory orbs gently bobbing like glowing flowers.
export function MemoryGarden({ audioRef, position = [8, 0, 0] }) {
  const group = useRef();
  const orbs = useMemo(
    () =>
      Array.from({ length: 26 }, () => ({
        p: [(Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 4.5],
        s: 0.12 + Math.random() * 0.34,
        ph: Math.random() * Math.PI * 2,
        hue: 0.78 + Math.random() * 0.14,
      })),
    [],
  );
  useFrame((state, dt) => {
    const s = audioRef?.current ? audioRef.current.sample() : { level: 0 };
    group.current.children.forEach((o, i) => {
      const d = orbs[i];
      if (!d) return;
      o.position.y = d.p[1] + Math.sin(state.clock.elapsedTime * 0.8 + d.ph) * 0.3;
      const sc = d.s * (1 + s.level * 0.8);
      o.scale.setScalar(sc);
    });
    group.current.rotation.y += dt * 0.05;
  });
  return (
    <group position={position}>
      <group ref={group}>
        {orbs.map((d, i) => (
          <mesh key={i} position={d.p}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(d.hue, 0.7, 0.7)}
              emissive={new THREE.Color().setHSL(d.hue, 0.8, 0.6)}
              emissiveIntensity={1.15}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <ZoneLabel title="记忆花园" sub="Memory Garden" />
    </group>
  );
}

// 后 · 声音神殿 — a ring of tall luminous pillars, a temple of sound.
export function SoundTemple({ audioRef, position = [0, -1, -11] }) {
  const group = useRef();
  const pillars = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);
  useFrame((state, dt) => {
    const s = audioRef?.current ? audioRef.current.sample() : { bass: 0 };
    const k = 1 + s.bass * 0.6;
    group.current.scale.y += (k - group.current.scale.y) * Math.min(1, dt * 4);
    group.current.rotation.y += dt * 0.03;
  });
  return (
    <group position={position}>
      <group ref={group}>
        {pillars.map((i) => {
          const a = (i / pillars.length) * Math.PI * 2;
          const R = 5;
          return (
            <mesh key={i} position={[Math.cos(a) * R, 0, Math.sin(a) * R]}>
              <cylinderGeometry args={[0.18, 0.26, 6, 12]} />
              <meshStandardMaterial
                color="#c4b5fd"
                emissive="#7c3aed"
                emissiveIntensity={0.95}
                toneMapped={false}
                transparent
                opacity={0.92}
              />
            </mesh>
          );
        })}
      </group>
      <group position={[0, 3.5, 0]}>
        <ZoneLabel title="声音神殿" sub="Sound Temple" />
      </group>
    </group>
  );
}
