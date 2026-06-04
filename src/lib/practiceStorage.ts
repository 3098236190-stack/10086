const STORAGE_KEY = "mirror-yourself:practice-progress";

export type PracticeProgress = {
  completedDays: number[];
  replies: Record<number, string>;
  lastVisitedDay: number;
};

const defaultProgress: PracticeProgress = {
  completedDays: [],
  replies: {},
  lastVisitedDay: 1,
};

export function loadPracticeProgress(): PracticeProgress {
  if (typeof window === "undefined") {
    return defaultProgress;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultProgress;
    }

    const parsed = JSON.parse(raw) as Partial<PracticeProgress>;

    return {
      completedDays: Array.isArray(parsed.completedDays)
        ? parsed.completedDays
        : [],
      replies: parsed.replies ?? {},
      lastVisitedDay:
        typeof parsed.lastVisitedDay === "number"
          ? parsed.lastVisitedDay
          : 1,
    };
  } catch {
    return defaultProgress;
  }
}

export function savePracticeProgress(progress: PracticeProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isDayCompleted(dayId: number): boolean {
  const progress = loadPracticeProgress();
  return progress.completedDays.includes(dayId);
}

export function isDayUnlocked(dayId: number): boolean {
  const progress = loadPracticeProgress();

  if (dayId <= 1) {
    return true;
  }

  return progress.completedDays.includes(dayId - 1);
}

export function getMaxUnlockedDay(): number {
  const progress = loadPracticeProgress();

  if (progress.completedDays.length === 0) {
    return 1;
  }

  const maxCompleted = Math.max(...progress.completedDays);

  return Math.min(maxCompleted + 1, 21);
}

export function completeDay(dayId: number): PracticeProgress {
  const progress = loadPracticeProgress();

  const completedDays = progress.completedDays.includes(dayId)
    ? progress.completedDays
    : [...progress.completedDays, dayId].sort((a, b) => a - b);

  const nextProgress: PracticeProgress = {
    ...progress,
    completedDays,
    lastVisitedDay: Math.min(dayId + 1, 21),
  };

  savePracticeProgress(nextProgress);

  return nextProgress;
}

export function saveReply(dayId: number, reply: string): PracticeProgress {
  const progress = loadPracticeProgress();

  const nextProgress: PracticeProgress = {
    ...progress,
    replies: {
      ...progress.replies,
      [dayId]: reply,
    },
    lastVisitedDay: dayId,
  };

  savePracticeProgress(nextProgress);

  return nextProgress;
}

export function getReply(dayId: number): string {
  const progress = loadPracticeProgress();
  return progress.replies[dayId] ?? "";
}
