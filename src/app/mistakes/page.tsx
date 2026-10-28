'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AppShell } from '@/components/shell';
import { ChatPanel } from '@/components/chat-panel';
import { MathInline } from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { CHAPTERS } from '@/lib/knowledge-data';
import { DIFFICULTY_LABEL } from '@/lib/questions-data';
import {
  type AttemptRecord,
  deleteAttempt,
  loadAttempts,
} from '@/lib/record-store';

export default function MistakesPage() {
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const list = loadAttempts().filter((a) => !a.correct);
    setAttempts(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, []);

  const active = useMemo(
    () => attempts.find((a) => a.id === activeId) ?? attempts[0] ?? null,
    [attempts, activeId],
  );

  const remove = (id: string) => {
    deleteAttempt(id);
    const next = attempts.filter((a) => a.id !== id);
    setAttempts(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  };

  const chapterTitle = (id: string) =>
    CHAPTERS.find((c) => c.id === id)?.title ?? id;

  return (
    <AppShell
      title="错题分析"
      subtitle="自动收录你做错的题，AI 给出错因诊断、引导式正解与同类题"
    >
      {attempts.length === 0 ? (
        <div className="paper-card flex flex-col items-center justify-center py-20 text-center text-sm text-[var(--ink-soft)]">
          <p className="font-serif-cn text-base text-[var(--ink)]">
            目前还没有错题。
          </p>
          <p className="mt-2">
            去
            <a
              href="/practice"
              className="mx-1 text-[var(--blackboard)] underline"
            >
              题目练习
            </a>
            做几道题，错题会自动收录到这里。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr_400px]">
          {/* 错题列表 */}
          <div className="paper-card max-h-[78vh] overflow-y-auto p-2">
            <div className="px-2 py-2 text-xs text-[var(--ink-soft)]">
              共 {attempts.length} 道错题
            </div>
            {attempts.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setActiveId(a.id)}
                className={[
                  'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                  a.id === active?.id
                    ? 'bg-[var(--red-pen-soft)] text-[var(--ink)]'
                    : 'text-[var(--ink)] hover:bg-[var(--muted)]',
                ].join(' ')}
              >
                <div className="flex items-center justify-between text-[10px] text-[var(--ink-soft)]">
                  <span>
                    {chapterTitle(a.chapterId)} · {DIFFICULTY_LABEL[a.difficulty]}
                  </span>
                  <span>{new Date(a.ts).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="mt-0.5 truncate font-serif-cn">
                  <MathInline content={a.stem} />
                </div>
              </button>
            ))}
          </div>

          {/* 错题详情 */}
          <div className="paper-card max-h-[78vh] overflow-y-auto p-6">
            {active && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
                    <span className="rounded-full bg-[var(--red-pen-soft)] px-2 py-0.5 text-[var(--red-pen)]">
                      做错于 {new Date(active.ts).toLocaleString('zh-CN')}
                    </span>
                    <span>{chapterTitle(active.chapterId)}</span>
                    <span>· {DIFFICULTY_LABEL[active.difficulty]}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => remove(active.id)}
                    className="border-[var(--border)] text-[var(--ink-soft)] hover:text-[var(--red-pen)]"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    移出错题本
                  </Button>
                </div>

                <div className="tutor-markdown">
                  <p>
                    <strong>题目：</strong>
                    <MathInline content={active.stem} />
                  </p>
                  <p>
                    <strong>你的答案：</strong>
                    <span className="text-[var(--red-pen)]">
                      <MathInline content={active.userAnswer} />
                    </span>
                  </p>
                  <p>
                    <strong>正确答案：</strong>
                    <span className="text-[var(--correct)]">
                      <MathInline content={active.answer} />
                    </span>
                  </p>
                </div>

                <div className="mt-4 rounded-md border-l-3 border-[var(--blackboard)] bg-[var(--paper)] p-4">
                  <div className="text-xs font-semibold text-[var(--blackboard)]">
                    标准解析
                  </div>
                  <div className="tutor-markdown mt-1 text-sm">
                    <MathInline content={active.analysis} />
                  </div>
                  {active.thinking && (
                    <div className="mt-2 text-xs text-[var(--ink-soft)]">
                      <strong>数学思想：</strong>
                      {active.thinking}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* AI 错题复盘 */}
          <div>
            <ChatPanel
              key={active?.id ?? 'empty'}
              module="mistake"
              extraContext={
                active
                  ? `学生本题做错。\n题干：${active.stem}\n学生答案：${active.userAnswer}\n正确答案：${active.answer}\n请按【错因诊断 → 正解思路（引导式）→ 同类题】结构来辅导。`
                  : undefined
              }
              greeting={`这道题做错了，没关系。先告诉我，你**当时是怎么想的**？我帮你看看是哪一步出了岔子。`}
              suggestions={[
                '我当时是这样想的……',
                '我不知道用哪个知识点',
                '给我一道同类型的题再试试',
              ]}
              height="78vh"
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
