import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  PracticeSectionKey,
  TOTAL_DAYS,
  getPracticeById,
} from "../data/practices";
import { PixelBuddy } from "../components/PixelBuddy";
import { usePracticeProgress } from "../hooks/usePracticeProgress";

const sectionLabels: Record<PracticeSectionKey, string> = {
  letter: "今日的信",
  mirror: "镜子练习",
  cognitive: "认知练习",
  meditation: "冥想引导",
  question: "今日问句",
};

const sectionIcons: Record<PracticeSectionKey, string> = {
  letter: "✉",
  mirror: "🪞",
  cognitive: "🧩",
  meditation: "🌙",
  question: "❓",
};

const sectionKeys: PracticeSectionKey[] = [
  "letter",
  "mirror",
  "cognitive",
  "meditation",
  "question",
];

export default function DayPage() {
  const params = useParams();
  const navigate = useNavigate();

  const dayId = Number(params.id);

  const {
    progress,
    isDayUnlocked,
    isDayCompleted,
    getReply,
    updateReply,
    markDayCompleted,
  } = usePracticeProgress();

  const practice = useMemo(() => getPracticeById(dayId), [dayId]);

  const [activeSection, setActiveSection] =
    useState<PracticeSectionKey>("letter");

  const [reply, setReply] = useState("");

  useEffect(() => {
    if (practice) {
      document.title = `Day ${practice.id} · ${practice.title}｜镜己`;
      setReply(getReply(practice.id));
      setActiveSection("letter");
    }
  }, [practice]);

  if (!practice) {
    return <Navigate to="/practice" replace />;
  }

  if (!isDayUnlocked(practice.id)) {
    return (
      <main className="day-page day-page--locked">
        <section className="locked-notice">
          <div className="locked-notice__buddy">
            <PixelBuddy mood="sleepy" size={88} />
          </div>
          <p className="eyebrow">🔒 STAGE LOCKED</p>
          <h1>Day {practice.id} 关卡未解锁</h1>
          <p>
            请先通关 Day {practice.id - 1}。冒险不是为了赶进度，而是为了让你慢慢靠近自己。
          </p>

          <Link to="/practice" className="btn btn--gold">
            ← 返回冒险地图
          </Link>
        </section>
      </main>
    );
  }

  function handleReplyChange(value: string) {
    if (!practice) return;
    setReply(value);
    updateReply(practice.id, value);
  }

  function handleComplete() {
    if (!practice) return;
    markDayCompleted(practice.id);

    if (practice.id < TOTAL_DAYS) {
      navigate(`/practice/day/${practice.id + 1}`);
    } else {
      navigate("/practice");
    }
  }

  const previousDay = practice.id > 1 ? practice.id - 1 : null;
  const nextDay = practice.id < TOTAL_DAYS ? practice.id + 1 : null;
  const completed = isDayCompleted(practice.id);

  return (
    <main className="day-page">
      <div className="screen">
        <nav className="day-nav">
          <Link to="/practice">← 冒险地图</Link>

          <div className="day-nav__actions">
            {previousDay && (
              <Link to={`/practice/day/${previousDay}`}>‹ 上一关</Link>
            )}

            {nextDay && isDayUnlocked(nextDay) && (
              <Link to={`/practice/day/${nextDay}`}>下一关 ›</Link>
            )}
          </div>
        </nav>

        <section className="day-hero">
          <div className="day-hero__buddy">
            <PixelBuddy level={progress.completedDays.length} size={72} />
          </div>

          <div className="day-hero__text">
            <p className="eyebrow">
              STAGE {String(practice.id).padStart(2, "0")} · WORLD {practice.week} ·{" "}
              {practice.minutes} MIN · {practice.id} / {TOTAL_DAYS}
            </p>

            <h1>{practice.title}</h1>

            {practice.subtitle && <p>{practice.subtitle}</p>}

            {completed && <span className="completed-badge">★ 已通关</span>}
          </div>
        </section>

        <section className="practice-tabs" aria-label="关卡任务切换">
          {sectionKeys.map((key) => (
            <button
              key={key}
              type="button"
              className={activeSection === key ? "active" : ""}
              onClick={() => setActiveSection(key)}
            >
              <span aria-hidden="true">{sectionIcons[key]}</span>{" "}
              {sectionLabels[key]}
            </button>
          ))}
        </section>

        <section className="practice-content">
          <h2>
            {sectionIcons[activeSection]} {sectionLabels[activeSection]}
          </h2>

          {practice.sections[activeSection].map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>

        <section className="reply-box">
          <div className="reply-box__header">
            <p className="eyebrow">📝 冒险笔记</p>
            <span>自动存档</span>
          </div>

          <label htmlFor="practice-reply">
            你想对今天的练习说什么？
          </label>

          <textarea
            id="practice-reply"
            value={reply}
            onChange={(event) => handleReplyChange(event.target.value)}
            placeholder="写给自己，不需要完美。"
            rows={6}
          />
        </section>

        <section className="day-actions">
          <button
            type="button"
            className="btn btn--gold btn--block"
            onClick={handleComplete}
          >
            {completed ? "★ 已通关 · 进入下一关" : "⚔ 完成关卡 · 领取 +1 EXP"}
          </button>
        </section>

        <section className="safety-note">
          <p>
            本练习仅用于自我觉察与情绪支持，不能替代专业心理咨询或医疗建议。
            如果你正在经历强烈痛苦、自伤想法或长期失眠，请及时联系专业人士或身边可信任的人。
          </p>
        </section>
      </div>
    </main>
  );
}
