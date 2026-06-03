import { useEffect, useState } from "react";
import {
  PracticeProgress,
  completeDay,
  getMaxUnlockedDay,
  getReply,
  isDayCompleted,
  isDayUnlocked,
  loadPracticeProgress,
  saveReply,
} from "../lib/practiceStorage";

export function usePracticeProgress() {
  const [progress, setProgress] = useState<PracticeProgress>(() =>
    loadPracticeProgress()
  );

  useEffect(() => {
    setProgress(loadPracticeProgress());
  }, []);

  function refreshProgress() {
    setProgress(loadPracticeProgress());
  }

  function markDayCompleted(dayId: number) {
    const nextProgress = completeDay(dayId);
    setProgress(nextProgress);
  }

  function updateReply(dayId: number, reply: string) {
    const nextProgress = saveReply(dayId, reply);
    setProgress(nextProgress);
  }

  return {
    progress,
    refreshProgress,
    markDayCompleted,
    updateReply,
    isDayUnlocked,
    isDayCompleted,
    getReply,
    getMaxUnlockedDay,
  };
}
