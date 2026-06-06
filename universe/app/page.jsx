"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Leva } from "leva";
import Intro from "@/components/Intro";
import HUD from "@/components/HUD";
import { createAudioEngine } from "@/lib/audio";

const Experience = dynamic(() => import("@/components/Experience"), { ssr: false });

export default function Page() {
  const audioRef = useRef(null);
  const [intro, setIntro] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [genre, setGenre] = useState("lofi");
  const [capturing, setCapturing] = useState(false);

  const ensureEngine = () => {
    if (!audioRef.current) audioRef.current = createAudioEngine();
    return audioRef.current;
  };

  const enter = useCallback(async () => {
    setIntro(false);
    const e = ensureEngine();
    e.setGenre(genre);
    try {
      await e.start();
      setPlaying(true);
    } catch (err) {
      /* user can press play */
    }
  }, [genre]);

  const toggle = useCallback(async () => {
    const e = ensureEngine();
    if (e.isPlaying()) {
      e.stop();
      setPlaying(false);
    } else {
      await e.start();
      setPlaying(true);
    }
  }, []);

  const chooseGenre = useCallback((id) => {
    setGenre(id);
    ensureEngine().setGenre(id);
  }, []);

  // Save = record the live output, then download it as an audio file.
  const save = useCallback(async () => {
    const e = ensureEngine();
    if (!e.isCapturing()) {
      if (!e.isPlaying()) {
        await e.start();
        setPlaying(true);
      }
      e.startCapture();
      setCapturing(true);
    } else {
      const blob = await e.stopCapture();
      setCapturing(false);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `liuguang-${genre}-${Date.now()}.wav`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
    }
  }, [genre]);

  return (
    <main className="stage">
      <Leva collapsed hidden={intro} />
      <Experience audioRef={audioRef} genre={genre} />
      <AnimatePresence>{intro && <Intro key="intro" onEnter={enter} />}</AnimatePresence>
      {!intro && (
        <HUD
          playing={playing}
          genre={genre}
          onToggle={toggle}
          onGenre={chooseGenre}
          onSave={save}
          capturing={capturing}
        />
      )}
    </main>
  );
}
