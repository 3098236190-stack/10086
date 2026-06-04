import { Link } from "react-router-dom";
import { PracticeDay } from "../data/practices";

type DayCardProps = {
  practice: PracticeDay;
  locked: boolean;
  completed: boolean;
};

export function DayCard({ practice, locked, completed }: DayCardProps) {
  if (locked) {
    return (
      <div className="day-card day-card--locked" aria-disabled="true">
        <div className="day-card__badge">🔒</div>
        <div className="day-card__meta">
          STAGE {String(practice.id).padStart(2, "0")} · {practice.minutes} MIN
        </div>

        <h3>{practice.title}</h3>

        <p>{practice.tag}</p>

        <span className="day-card__status">
          通关 Day {practice.id - 1} 解锁
        </span>
      </div>
    );
  }

  return (
    <Link
      to={`/practice/day/${practice.id}`}
      className={`day-card ${completed ? "day-card--completed" : "day-card--open"}`}
      aria-label={`进入 Day ${practice.id}：${practice.title}`}
    >
      <div className="day-card__badge">{completed ? "★" : "▶"}</div>
      <div className="day-card__meta">
        STAGE {String(practice.id).padStart(2, "0")} · {practice.minutes} MIN
      </div>

      <h3>{practice.title}</h3>

      <p>{practice.tag}</p>

      <span className="day-card__status">
        {completed ? "✓ 已通关" : "▶ 进入关卡"}
      </span>
    </Link>
  );
}
