import "./globals.css";

export const metadata = {
  title: "流光 · 声音宇宙 / Sound Universe",
  description:
    "一个会呼吸的声音生命体与你的声音宇宙。An audio-reactive 3D digital lifeform — built with Next.js, React Three Fiber, Three.js, GSAP, Framer Motion & postprocessing.",
};

export const viewport = {
  themeColor: "#06060c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
