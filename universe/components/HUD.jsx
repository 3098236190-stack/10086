"use client";

import { motion } from "framer-motion";
import { GENRES } from "@/lib/audio";

export default function HUD({ playing, genre, onToggle, onGenre }) {
  return (
    <motion.div
      className="hud"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <div className="hud-brand">
        <span className="dot" />
        流光 · Sound Universe
      </div>

      <div className="hud-genres">
        {Object.entries(GENRES).map(([id, g]) => (
          <button
            key={id}
            type="button"
            className={`chip ${genre === id ? "active" : ""}`}
            onClick={() => onGenre(id)}
          >
            {g.zh}
          </button>
        ))}
      </div>

      <button className={`play ${playing ? "on" : ""}`} type="button" onClick={onToggle}>
        {playing ? "❚❚ 暂停" : "▶ 让它苏醒"}
      </button>
    </motion.div>
  );
}
