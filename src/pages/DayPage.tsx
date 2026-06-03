import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  PracticeSectionKey,
  TOTAL_DAYS,
  getPracticeById,
} from "../data/practices";
import { usePracticeProgress } from "../hooks/usePracticeProgress";

const sectionLabels: Record<PracticeSectionKey, string> = {
  letter: "今日的信",
  mirror: "镜子练习",
  cognitive: "认知练习",
  meditation: "冥想引导",
  question: "今日问句",
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
          <p className="eyebrow">LOCKED</p>
          <h1>Day {practice.id} 还没有解锁</h1>
          <p>
            请先完成 Day {practice.id - 1}。练习不是为了赶进度，而是为了让你慢慢靠近自己。
          </p>

          <Link to="/practice" className="primary-button">
            返回 21 天练习
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
      <nav className="day-nav">
        <Link to="/practice">← 返回练习列表</Link>

        <div className="day-nav__actions">
          {previousDay && (
            <Link to={`/practice/day/${previousDay}`}>上一日</Link>
          )}

          {nextDay && isDayUnlocked(nextDay) && (
            <Link to={`/practice/day/${nextDay}`}>下一日</Link>
          )}
        </div>
      </nav>

      <section className="day-hero">
        <p className="eyebrow">
          DAY {String(practice.id).padStart(2, "0")} · WEEK {practice.week} ·{" "}
          {practice.minutes} MIN · {practice.id} / {TOTAL_DAYS}
        </p>

        <h1>{practice.title}</h1>

        {practice.subtitle && <p>{practice.subtitle}</p>}

        {completed && <span className="completed-badge">已完成</span>}
      </section>

      <section className="practice-tabs" aria-label="练习内容切换">
        {sectionKeys.map((key) => (
          <button
            key={key}
            type="button"
            className={activeSection === key ? "active" : ""}
            onClick={() => setActiveSection(key)}
          >
            {sectionLabels[key]}
          </button>
        ))}
      </section>

      <section className="practice-content">
        <h2>{sectionLabels[activeSection]}</h2>

        {practice.sections[activeSection].map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </section>

      <section className="reply-box">
        <div className="reply-box__header">
          <p className="eyebrow">REPLY</p>
          <span>SAVED</span>
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
          className="primary-button"
          onClick={handleComplete}
        >
          {completed ? "已完成，进入下一天" : "完成今天的练习"}
        </button>
      </section>

      <section className="safety-note">
        <p>
          本练习仅用于自我觉察与情绪支持，不能替代专业心理咨询或医疗建议。
          如果你正在经历强烈痛苦、自伤想法或长期失眠，请及时联系专业人士或身边可信任的人。
        </p>
      </section>
    </main>
  );
}
