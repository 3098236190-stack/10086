"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Poetic beats, timed to ride the camera journey (see StoryDirector).
const BEATS = [
  { zh: "它，注意到了你。", en: "It notices you.", dur: 3000 },
  { zh: "时间，静止了。", en: "Time freezes.", dur: 3000 },
  { zh: "光，从核心亮起。", en: "Light wakes within the core.", dur: 3000 },
  { zh: "模拟时代 —— 声音被刻进黑胶与磁带。", en: "The Analog Age — sound pressed into vinyl and tape.", dur: 4000 },
  { zh: "互联网时代 —— 声音被无限复制、传播。", en: "The Internet Age — sound copied and spread without end.", dur: 4000 },
  { zh: "AI 时代 —— 一切，都能被生成。", en: "The AI Age — everything can be generated.", dur: 4000 },
  { zh: "一切都能被生成，意义却变得稀有。", en: "Everything can be generated — but meaning becomes rare.", dur: 4200 },
  { zh: "于是，宇宙坍缩成一粒。", en: "And so the universe collapses into a single particle.", dur: 3200, flash: true },
  { zh: "那一粒，进化成了 —— 流光。", en: "That particle evolves into — LUX.", dur: 3200 },
  { zh: "我让情绪，重新有了形体。\n现在，进入你的创造宇宙。", en: "I give emotion a form again. Enter your creation universe.", dur: 4600 },
];

export default function StoryOverlay({ active, onArrive }) {
  const [i, setI] = useState(0);
  const [flash, setFlash] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    if (!active) return undefined;
    setI(0);
    let acc = 0;
    timers.current = [];
    BEATS.forEach((b, idx) => {
      timers.current.push(
        setTimeout(() => {
          setI(idx);
          if (b.flash) {
            setFlash(true);
            setTimeout(() => setFlash(false), 900);
          }
        }, acc),
      );
      acc += b.dur;
    });
    timers.current.push(setTimeout(() => onArrive && onArrive(), acc + 600));
    return () => timers.current.forEach(clearTimeout);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null;
  const beat = BEATS[Math.min(i, BEATS.length - 1)];

  return (
    <div className="story-mode">
      <AnimatePresence>
        {flash && (
          <motion.div
            className="story-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
        )}
      </AnimatePresence>

      <div className="story-cap">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
            transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <p className="story-cap-zh">{beat.zh}</p>
            <p className="story-cap-en">{beat.en}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button className="story-skip-btn" type="button" onClick={() => onArrive && onArrive()}>
        跳过 Skip ›
      </button>
    </div>
  );
}
