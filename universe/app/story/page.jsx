"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const SCENES = [
  {
    en: ["We are living in a new creative era.", "Images. Videos. Voices. Worlds — everything can be generated."],
    zh: ["我们正处在一个全新的创造纪元。", "图像、视频、声音、世界 —— 一切都能被生成。"],
  },
  {
    en: ["But expression has not become easier.", "People produce more content than ever, yet feel less understood."],
    zh: ["但「表达自己」并没有变得更容易。", "我们产出前所未有的内容，却比以往更难被理解。"],
  },
  {
    en: ["The problem is not creation.", "Emotion has no physical form in digital space."],
    zh: ["问题不在于创造。", "而在于 —— 情绪在数字世界里没有形体。"],
  },
  {
    en: ["So we asked a question.", "What if sound could become visible?", "What if emotion could become a living universe?"],
    zh: ["于是我们发问：", "如果声音可以被看见？", "如果情绪可以成为一个活着的宇宙？"],
  },
  {
    en: ["LUX is not a music tool.", "It is a living sound universe where emotion becomes matter."],
    zh: ["流光，不是一个音乐工具。", "它是一个让情绪化作物质的、活着的声音宇宙。"],
  },
  {
    en: ["Your music is not played.", "It is born. It evolves. It leaves traces in space."],
    zh: ["你的音乐不是被播放，", "而是被诞生、会进化、在空间里留下痕迹。"],
  },
  {
    en: ["You are not just a user.", "You are a creator of sound worlds."],
    zh: ["你不只是使用者。", "你是声音世界的创造者。"],
  },
];

function Scene({ idx, en, zh }) {
  return (
    <section className="story-scene">
      <motion.div
        className="story-block"
        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <span className="story-index">{String(idx + 1).padStart(2, "0")}</span>
        <div className="story-en">
          {en.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
        <div className="story-zh">
          {zh.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default function Story() {
  return (
    <main className="story">
      <div className="story-stars" aria-hidden="true" />

      <header className="story-nav">
        <Link href="/" className="story-home">
          ← 流光 · LUX
        </Link>
      </header>

      <section className="story-scene story-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1] }}
          className="story-block"
        >
          <p className="story-kicker">THE STORY · 一个新世界的开场</p>
          <h1 className="story-title">
            We are not building a music tool.
            <span>We are building a space where emotion becomes visible.</span>
          </h1>
          <p className="story-scroll-hint">向下滚动 · scroll ↓</p>
        </motion.div>
      </section>

      {SCENES.map((s, i) => (
        <Scene key={i} idx={i} en={s.en} zh={s.zh} />
      ))}

      <section className="story-scene story-end">
        <motion.div
          className="story-block"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <h2 className="story-title">
            进入流光
            <span>Enter the sound universe.</span>
          </h2>
          <Link href="/" className="story-enter">
            进入 · Enter
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
