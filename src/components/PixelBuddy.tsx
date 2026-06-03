type BuddyMood = "sleepy" | "smile" | "happy" | "cheer";

type PixelBuddyProps = {
  /** 已通关天数，用来决定小人的心情/进化程度 */
  level?: number;
  /** 直接指定心情，优先于 level 推导 */
  mood?: BuddyMood;
  size?: number;
};

function moodFromLevel(level: number): BuddyMood {
  if (level <= 0) return "sleepy";
  if (level < 3) return "smile";
  if (level < 7) return "happy";
  return "cheer";
}

// 像素调色板：随等级变化的身体颜色（数码小人进化感）
const bodyColors: Record<BuddyMood, string> = {
  sleepy: "#8bb6e0", // 还没醒来的冷蓝
  smile: "#7cc36a", // 抽芽的绿
  happy: "#5fb84e", // 更饱满的绿
  cheer: "#ffcf3f", // 闪光的金
};

// 12x12 像素网格的身体形状（# = 身体）
const BODY = [
  "....####....",
  "...######...",
  "..########..",
  ".##########.",
  "############",
  "############",
  "############",
  "############",
  ".##########.",
  "..########..",
  "...######...",
  "....####....",
];

export function PixelBuddy({ level = 0, mood, size = 72 }: PixelBuddyProps) {
  const finalMood = mood ?? moodFromLevel(level);
  const body = bodyColors[finalMood];
  const grid = 12;
  const cell = size / grid;

  const cells: JSX.Element[] = [];
  BODY.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === "#") {
        cells.push(
          <rect
            key={`b-${x}-${y}`}
            x={x * cell}
            y={y * cell}
            width={cell}
            height={cell}
            fill={body}
          />
        );
      }
    });
  });

  // 眼睛位置（白底 + 黑瞳）
  const eyeY = 4;
  const leftEyeX = 3;
  const rightEyeX = 7;
  const sleepy = finalMood === "sleepy";

  // 嘴巴：随心情张大
  const mouthCells =
    finalMood === "cheer"
      ? [
          [4, 8],
          [5, 8],
          [6, 8],
          [7, 8],
          [4, 9],
          [5, 9],
          [6, 9],
          [7, 9],
        ]
      : finalMood === "happy"
      ? [
          [4, 8],
          [5, 8],
          [6, 8],
          [7, 8],
        ]
      : finalMood === "smile"
      ? [
          [4, 8],
          [7, 8],
          [5, 9],
          [6, 9],
        ]
      : [
          [5, 8],
          [6, 8],
        ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="数码小人伙伴"
      style={{ imageRendering: "pixelated" }}
    >
      {cells}

      {/* 眼睛白 */}
      {!sleepy && (
        <>
          <rect x={leftEyeX * cell} y={eyeY * cell} width={cell * 2} height={cell * 2} fill="#fff" />
          <rect x={rightEyeX * cell} y={eyeY * cell} width={cell * 2} height={cell * 2} fill="#fff" />
          {/* 黑瞳 */}
          <rect x={(leftEyeX + 1) * cell} y={(eyeY + 1) * cell} width={cell} height={cell} fill="#241f1c" />
          <rect x={(rightEyeX + 1) * cell} y={(eyeY + 1) * cell} width={cell} height={cell} fill="#241f1c" />
        </>
      )}

      {/* 睡眼（闭眼横线） */}
      {sleepy && (
        <>
          <rect x={leftEyeX * cell} y={(eyeY + 1) * cell} width={cell * 2} height={cell} fill="#241f1c" />
          <rect x={rightEyeX * cell} y={(eyeY + 1) * cell} width={cell * 2} height={cell} fill="#241f1c" />
        </>
      )}

      {/* 嘴巴 */}
      {mouthCells.map(([mx, my]) => (
        <rect key={`m-${mx}-${my}`} x={mx * cell} y={my * cell} width={cell} height={cell} fill="#241f1c" />
      ))}

      {/* 腮红（开心时） */}
      {(finalMood === "happy" || finalMood === "cheer") && (
        <>
          <rect x={2 * cell} y={6 * cell} width={cell} height={cell} fill="#ff8da1" opacity={0.8} />
          <rect x={9 * cell} y={6 * cell} width={cell} height={cell} fill="#ff8da1" opacity={0.8} />
        </>
      )}
    </svg>
  );
}
