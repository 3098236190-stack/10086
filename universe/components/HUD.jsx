"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GENRES } from "@/lib/audio";

export default function HUD({
  playing,
  genre,
  onToggle,
  onGenre,
  onSave,
  capturing,
  onMic,
  micOn,
  onFilm,
  filming,
  onStory,
}) {
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

      <Link className="story-link" href="/story">
        STORY ↗
      </Link>

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

      <button className={`save ${capturing ? "rec" : ""}`} type="button" onClick={onSave}>
        {capturing ? "● 录制中 · 点此保存" : "↓ 保存音乐"}
      </button>

      <button className={`save ${micOn ? "rec" : ""}`} type="button" onClick={onMic}>
        {micOn ? "🎙 麦克风开" : "🎙 麦克风"}
      </button>

      <button className={`save ${filming ? "rec" : ""}`} type="button" onClick={onFilm}>
        {filming ? "● 录像中 · 点此保存" : "🎬 录视频"}
      </button>

      <button className="story-enter-btn" type="button" onClick={onStory}>
        进入故事 · Enter the Story →
      </button>
    </motion.div>
  );
}
