'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AppShell } from '@/components/shell';
import { MathInline } from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CHAPTERS } from '@/lib/knowledge-data';
import { DIFFICULTY_LABEL } from '@/lib/questions-data';
import {
  type AttemptRecord,
  clearAttempts,
  loadAttempts,
  statsByChapter,
} from '@/lib/record-store';

interface DailyStat {
  date: string;
  total: number;
  correct: number;
}

function dailyStats(list: AttemptRecord[]): DailyStat[] {
  const map = new Map<string, DailyStat>();
  for (const a of list) {
    const d = new Date(a.ts);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const cur = map.get(key) ?? { date: key, total: 0, correct: 0 };
    cur.total += 1;
    if (a.correct) cur.correct += 1;
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export default function RecordsPage() {
  const [list, setList] = useState<AttemptRecord[]>([]);
  useEffect(() => {
    setList(loadAttempts());
  }, []);

  const total = list.length;
  const correctCount = list.filter((a) => a.correct).length;
  const overallRate = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const chapterStats = useMemo(() => statsByChapter(list), [list]);
  const daily = useMemo(() => dailyStats(list), [list]);

  // 难度分布
  const diffStats = useMemo(() => {
    const map = new Map<string, { total: number; correct: number }>();
    for (const a of list) {
      const cur = map.get(a.difficulty) ?? { total: 0, correct: 0 };
      cur.total += 1;
      if (a.correct) cur.correct += 1;
      map.set(a.difficulty, cur);
    }
    return Array.from(map.entries()).map(([k, v]) => ({
      difficulty: k as 'basic' | 'medium' | 'advanced',
      ...v,
      rate: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    }));
  }, [list]);

  const handleClear = () => {
    if (!window.confirm('确认清空所有学习记录？')) return;
    clearAttempts();
    setList([]);
  };

  return (
    <AppShell
      title="学习记录"
      subtitle="追踪做题量、正确率与薄弱分布，看见自己的成长曲线"
    >
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="累计做题" value={`${total}`} hint="次提交" />
        <StatCard
          label="正确率"
          value={`${overallRate}%`}
          hint={`${correctCount} / ${total}`}
        />
        <StatCard
          label="活跃天数"
          value={`${daily.length}`}
          hint="有学习记录的天数"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 章节掌握度 */}
        <div className="paper-card p-5">
          <h3 className="font-serif-cn text-base font-bold text-[var(--ink)]">
            章节掌握度
          </h3>
          {chapterStats.length === 0 ? (
            <p className="mt-3 text-xs text-[var(--ink-soft)]">
              暂无数据，去做题或测评吧。
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {chapterStats.map((s) => {
                const title =
                  CHAPTERS.find((c) => c.id === s.chapterId)?.title ?? s.chapterId;
                const rate = Math.round((s.correct / s.total) * 100);
                return (
                  <div key={s.chapterId}>
                    <div className="flex justify-between text-xs text-[var(--ink-soft)]">
                      <span>{title}</span>
                      <span>
                        {s.correct} / {s.total} · {rate}%
                      </span>
                    </div>
                    <Progress value={rate} className="mt-1 h-1.5" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 难度表现 */}
        <div className="paper-card p-5">
          <h3 className="font-serif-cn text-base font-bold text-[var(--ink)]">
            不同难度表现
          </h3>
          {diffStats.length === 0 ? (
            <p className="mt-3 text-xs text-[var(--ink-soft)]">暂无数据。</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {diffStats.map((d) => (
                <div
                  key={d.difficulty}
                  className="rounded-md border border-dashed border-[var(--border)] bg-[var(--paper)] p-3 text-center"
                >
                  <div className="text-xs text-[var(--ink-soft)]">
                    {DIFFICULTY_LABEL[d.difficulty]}
                  </div>
                  <div className="font-serif-cn text-2xl font-bold text-[var(--blackboard)]">
                    {d.rate}%
                  </div>
                  <div className="text-[10px] text-[var(--ink-soft)]">
                    {d.correct} / {d.total}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 每日 */}
      <div className="paper-card mt-4 p-5">
        <h3 className="font-serif-cn text-base font-bold text-[var(--ink)]">
          每日做题量
        </h3>
        {daily.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--ink-soft)]">暂无数据。</p>
        ) : (
          <div className="mt-4 flex h-32 items-end gap-2 overflow-x-auto">
            {daily.slice(-30).map((d) => {
              const h = Math.max(8, Math.min(120, d.total * 12));
              const rate =
                d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
              return (
                <div
                  key={d.date}
                  className="flex w-8 flex-col items-center gap-1"
                  title={`${d.date} · 正确率 ${rate}%`}
                >
                  <div
                    className="w-full rounded-t bg-[var(--blackboard)]"
                    style={{ height: `${h}px` }}
                  />
                  <div className="text-[9px] text-[var(--ink-soft)]">
                    {d.date.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 最近记录 */}
      <div className="paper-card mt-4 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif-cn text-base font-bold text-[var(--ink)]">
            最近记录（最新 20 条）
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={total === 0}
            className="border-[var(--border)] text-[var(--ink-soft)] hover:text-[var(--red-pen)]"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            清空记录
          </Button>
        </div>
        {list.length === 0 ? (
          <p className="text-xs text-[var(--ink-soft)]">暂无数据。</p>
        ) : (
          <div className="divide-y divide-dashed divide-[var(--border)]">
            {list.slice(0, 20).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 py-2.5 text-xs"
              >
                <div className="flex-1 truncate">
                  <span className="font-serif-cn text-[var(--ink)]">
                    <MathInline content={a.stem} />
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[var(--ink-soft)]">
                  <span>{DIFFICULTY_LABEL[a.difficulty]}</span>
                  <span
                    className={
                      a.correct
                        ? 'text-[var(--correct)]'
                        : 'text-[var(--red-pen)]'
                    }
                  >
                    {a.correct ? '答对' : '答错'}
                  </span>
                  <span>{new Date(a.ts).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="paper-card px-5 py-4">
      <div className="text-xs text-[var(--ink-soft)]">{label}</div>
      <div className="mt-1 font-serif-cn text-3xl font-bold text-[var(--blackboard)]">
        {value}
      </div>
      {hint && <div className="text-[10px] text-[var(--ink-soft)]">{hint}</div>}
    </div>
  );
}
