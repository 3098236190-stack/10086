"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = [
  { zh: "起初，只有一粒声音。", en: "In the beginning, a single grain of sound." },
  { zh: "它们聚拢，一个声音生命体醒来。", en: "They gather — a living sound being awakens." },
  { zh: "当音乐响起，光，扩展成一个宇宙。", en: "With music, light expands into a universe." },
];

export default function Intro({ onEnter }) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (i >= LINES.length) {
      setDone(true);
      return;
    }
    const id = setTimeout(() => setI((v) => v + 1), 2600);
    return () => clearTimeout(id);
  }, [i]);

  return (
    <motion.div
      className="intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1 }}
    >
      <div className="intro-center">
        <AnimatePresence mode="wait">
          {!done && (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
              transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
              className="intro-line"
            >
              <span className="zh">{LINES[Math.min(i, LINES.length - 1)].zh}</span>
              <span className="en">{LINES[Math.min(i, LINES.length - 1)].en}</span>
            </motion.div>
          )}

          {done && (
            <motion.div
              key="enter"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
              className="intro-line"
            >
              <span className="zh">这，是你的声音宇宙。</span>
              <span className="en">This is your sound universe.</span>
              <button className="enter-btn" type="button" onClick={onEnter}>
                进入 · Enter
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button className="skip-btn" type="button" onClick={onEnter}>
        跳过 Skip ›
      </button>
    </motion.div>
  );
}
