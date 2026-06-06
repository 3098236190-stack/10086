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
  const [micOn, setMicOn] = useState(false);
  const [filming, setFilming] = useState(false);
  const videoRec = useRef(null);
  const videoChunks = useRef([]);

  const ensureEngine = () => {
    if (!audioRef.current) audioRef.current = createAudioEngine();
    return audioRef.current;
  };

  const download = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
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
      if (blob) download(blob, `liuguang-${genre}-${Date.now()}.wav`);
    }
  }, [genre]);

  // Microphone: blend your own voice/sound into the universe.
  const toggleMic = useCallback(async () => {
    const e = ensureEngine();
    try {
      const on = await e.toggleMic();
      setMicOn(on);
    } catch (err) {
      alert("无法访问麦克风，请检查浏览器权限。");
    }
  }, []);

  // Film = record the 3D scene (canvas) + sound into a video.
  const film = useCallback(async () => {
    const e = ensureEngine();
    if (!filming) {
      if (!e.isPlaying()) {
        await e.start();
        setPlaying(true);
      }
      const canvas = document.querySelector(".stage canvas") || document.querySelector("canvas");
      if (!canvas || !canvas.captureStream) {
        alert("此浏览器不支持画面录制。");
        return;
      }
      const vstream = canvas.captureStream(30);
      const astream = e.getAudioStream();
      const tracks = [...vstream.getVideoTracks(), ...(astream ? astream.getAudioTracks() : [])];
      const mixed = new MediaStream(tracks);
      const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(
        (m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m),
      );
      videoChunks.current = [];
      videoRec.current = new MediaRecorder(mixed, mime ? { mimeType: mime } : undefined);
      videoRec.current.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) videoChunks.current.push(ev.data);
      };
      videoRec.current.start();
      setFilming(true);
    } else {
      const rec = videoRec.current;
      if (rec) {
        rec.onstop = () => {
          const blob = new Blob(videoChunks.current, { type: "video/webm" });
          download(blob, `liuguang-${genre}-${Date.now()}.webm`);
        };
        rec.stop();
      }
      setFilming(false);
    }
  }, [filming, genre]);

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
          onMic={toggleMic}
          micOn={micOn}
          onFilm={film}
          filming={filming}
        />
      )}
    </main>
  );
}
