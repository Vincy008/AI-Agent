'use client';

/**
 * 学习记录：使用 localStorage 持久化。
 * 包含：做题历史、错题、对话计数。
 */

export interface AttemptRecord {
  id: string; // questionId + timestamp
  questionId: string;
  chapterId: string;
  pointId: string;
  difficulty: 'basic' | 'medium' | 'advanced';
  stem: string;
  correct: boolean;
  userAnswer: string;
  answer: string;
  analysis: string;
  thinking: string;
  ts: number;
}

const KEY = 'fanggematth_attempts_v1';

export function loadAttempts(): AttemptRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AttemptRecord[];
  } catch {
    return [];
  }
}

export function saveAttempt(r: Omit<AttemptRecord, 'id' | 'ts'>): AttemptRecord {
  const item: AttemptRecord = {
    ...r,
    id: `${r.questionId}-${Date.now()}`,
    ts: Date.now(),
  };
  const list = loadAttempts();
  list.unshift(item);
  // 限制最多 500 条
  const trimmed = list.slice(0, 500);
  window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  return item;
}

export function deleteAttempt(id: string) {
  const list = loadAttempts().filter((a) => a.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearAttempts() {
  window.localStorage.removeItem(KEY);
}

export interface ChapterStats {
  chapterId: string;
  total: number;
  correct: number;
}

export function statsByChapter(list: AttemptRecord[]): ChapterStats[] {
  const map = new Map<string, ChapterStats>();
  for (const a of list) {
    const cur = map.get(a.chapterId) ?? {
      chapterId: a.chapterId,
      total: 0,
      correct: 0,
    };
    cur.total += 1;
    if (a.correct) cur.correct += 1;
    map.set(a.chapterId, cur);
  }
  return Array.from(map.values());
}
