import { Link } from "react-router-dom";
import { DayCard } from "../components/DayCard";
import { getPracticesByWeek, getWeeks } from "../data/practices";
import { usePracticeProgress } from "../hooks/usePracticeProgress";

export default function PracticePage() {
  const { isDayUnlocked, isDayCompleted, getMaxUnlockedDay } =
    usePracticeProgress();

  const maxUnlockedDay = getMaxUnlockedDay();

  return (
    <main className="practice-page">
      <section className="practice-hero">
        <p className="eyebrow">YOUR HEALING JOURNEY</p>
        <h1>21 天练习</h1>
        <p>每天 15–20 分钟，从看见，到理解，到和解。</p>

        <Link to={`/practice/day/${maxUnlockedDay}`} className="primary-button">
          继续练习 Day {maxUnlockedDay}
        </Link>
      </section>

      <section className="practice-weeks">
        {getWeeks().map((week) => {
          const days = getPracticesByWeek(week.week);

          return (
            <div key={week.week} className="week-section">
              <div className="week-section__header">
                <p className="eyebrow">{week.season}</p>
                <h2>
                  Week {String(week.week).padStart(2, "0")} · {week.phase}
                </h2>
                <p>{week.description}</p>
              </div>

              <div className="day-grid">
                {days.length === 0 ? (
                  <p className="week-section__coming">内容即将上线，敬请期待。</p>
                ) : (
                  days.map((practice) => (
                    <DayCard
                      key={practice.id}
                      practice={practice}
                      locked={!isDayUnlocked(practice.id)}
                      completed={isDayCompleted(practice.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
