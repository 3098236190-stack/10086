import { Link } from "react-router-dom";
import { DayCard } from "../components/DayCard";
import { PixelBuddy } from "../components/PixelBuddy";
import { TOTAL_DAYS, getPracticesByWeek, getWeeks } from "../data/practices";
import { usePracticeProgress } from "../hooks/usePracticeProgress";

export default function PracticePage() {
  const { progress, isDayUnlocked, isDayCompleted, getMaxUnlockedDay } =
    usePracticeProgress();

  const maxUnlockedDay = getMaxUnlockedDay();
  const clearedCount = progress.completedDays.length;
  const xpPercent = Math.round((clearedCount / TOTAL_DAYS) * 100);

  return (
    <main className="practice-page">
      <div className="screen">
        {/* 游戏 HUD：数码小人 + 等级 + 经验条 */}
        <header className="hud">
          <div className="hud__buddy">
            <PixelBuddy level={clearedCount} size={76} />
          </div>

          <div className="hud__info">
            <div className="hud__level">
              Lv.{clearedCount} · 觉察者
            </div>
            <div className="xp-bar" role="progressbar" aria-valuenow={xpPercent}>
              <span className="xp-bar__fill" style={{ width: `${xpPercent}%` }} />
            </div>
            <div className="hud__xp">
              已通关 {clearedCount} / {TOTAL_DAYS} 关 · EXP {xpPercent}%
            </div>
          </div>

          <Link to={`/practice/day/${maxUnlockedDay}`} className="btn btn--gold">
            ▶ 继续冒险 Day {maxUnlockedDay}
          </Link>
        </header>

        <section className="quest-hero">
          <p className="eyebrow">MIRROR YOURSELF · 数码疗愈冒险</p>
          <h1>21 关 · 镜己冒险</h1>
          <p>每天一关，5–20 分钟。陪你的数码小人，从「看见」走到「和解」。</p>
        </section>

        <section className="worlds">
          {getWeeks().map((week, index) => {
            const days = getPracticesByWeek(week.week);

            return (
              <div key={week.week} className="world" data-week={week.week}>
                <div className="world__header">
                  <span className="world__no">
                    WORLD {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2>
                    {week.season.split(" · ")[0]} · {week.phase}
                  </h2>
                  <p>{week.description}</p>
                </div>

                <div className="stage-grid">
                  {days.length === 0 ? (
                    <div className="stage-grid__coming">
                      <span>⛏</span> 新世界建造中…即将开放
                    </div>
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
      </div>
    </main>
  );
}
