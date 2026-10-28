'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/shell';
import { ChatPanel } from '@/components/chat-panel';
import { MathInline } from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CHAPTERS } from '@/lib/knowledge-data';
import {
  DIFFICULTY_LABEL,
  QUESTIONS,
  type Difficulty,
  type Question,
} from '@/lib/questions-data';
import { saveAttempt } from '@/lib/record-store';

const DIFFS: Array<Difficulty | 'all'> = ['all', 'basic', 'medium', 'advanced'];

interface GradeResult {
  correct: boolean;
  analysis: string;
  thinking: string;
}

export default function PracticePage() {
  const [chapterId, setChapterId] = useState<string>('all');
  const [diff, setDiff] = useState<Difficulty | 'all'>('all');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo<Question[]>(() => {
    return QUESTIONS.filter(
      (q) =>
        (chapterId === 'all' || q.chapterId === chapterId) &&
        (diff === 'all' || q.difficulty === diff),
    );
  }, [chapterId, diff]);

  useEffect(() => {
    if (filtered.length === 0) {
      setCurrentId(null);
      return;
    }
    if (!currentId || !filtered.find((q) => q.id === currentId)) {
      setCurrentId(filtered[0].id);
      setAnswer('');
      setResult(null);
    }
  }, [filtered, currentId]);

  const current = currentId ? QUESTIONS.find((q) => q.id === currentId) : null;

  const submit = async () => {
    if (!current) return;
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: current.id, userAnswer: answer }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error ?? '判分失败');
      const r: GradeResult = {
        correct: data.correct,
        analysis: data.analysis,
        thinking: data.thinking,
      };
      setResult(r);
      saveAttempt({
        questionId: current.id,
        chapterId: current.chapterId,
        pointId: current.pointId,
        difficulty: current.difficulty,
        stem: current.stem,
        correct: r.correct,
        userAnswer: answer,
        answer: data.answer,
        analysis: data.analysis,
        thinking: data.thinking,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '出错了';
      setResult({ correct: false, analysis: msg, thinking: '' });
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (!current) return;
    const idx = filtered.findIndex((q) => q.id === current.id);
    const nx = filtered[(idx + 1) % filtered.length];
    setCurrentId(nx.id);
    setAnswer('');
    setResult(null);
  };

  return (
    <AppShell
      title="题目练习"
      subtitle="基础 / 提高 / 拓展三档，做完立即判分，AI 陪你复盘"
    >
      {/* 筛选 */}
      <div className="paper-card mb-4 flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="text-xs text-[var(--ink-soft)]">章节：</span>
        <select
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs"
        >
          <option value="all">全部章节</option>
          {CHAPTERS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.grade}{c.term} · {c.title}
            </option>
          ))}
        </select>
        <span className="ml-3 text-xs text-[var(--ink-soft)]">难度：</span>
        <div className="flex gap-1">
          {DIFFS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDiff(d)}
              className={[
                'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                diff === d
                  ? 'border-[var(--blackboard)] bg-[var(--blackboard)] text-[var(--chalk)]'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--ink-soft)] hover:border-[var(--blackboard)]',
              ].join(' ')}
            >
              {d === 'all' ? '全部' : DIFFICULTY_LABEL[d as Difficulty]}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-[var(--ink-soft)]">
          共 {filtered.length} 道
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
        {/* 左：题目 */}
        <div className="paper-card p-6">
          {!current ? (
            <div className="py-12 text-center text-sm text-[var(--ink-soft)]">
              当前筛选下没有题目，换一个组合试试？
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2 text-xs text-[var(--ink-soft)]">
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[var(--accent-foreground)]">
                  {DIFFICULTY_LABEL[current.difficulty]}
                </span>
                <span>
                  {CHAPTERS.find((c) => c.id === current.chapterId)?.title}
                </span>
              </div>
              <div className="tutor-markdown text-base">
                <p>
                  <strong>题目：</strong>
                  <MathInline content={current.stem} />
                </p>
              </div>
              {current.options && (
                <div className="mt-4 space-y-2">
                  {current.options.map((opt) => (
                    <label
                      key={opt}
                      className={[
                        'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors',
                        answer.trim().toUpperCase().startsWith(opt[0])
                          ? 'border-[var(--blackboard)] bg-[var(--accent)]/30'
                          : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--blackboard)]',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="opt"
                        value={opt[0]}
                        checked={answer.trim().toUpperCase().startsWith(opt[0])}
                        onChange={() => {
                          setAnswer(opt[0]);
                          setResult(null);
                        }}
                        className="accent-[var(--blackboard)]"
                      />
                      <MathInline content={opt} />
                    </label>
                  ))}
                </div>
              )}
              {!current.options && (
                <div className="mt-4">
                  <Textarea
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      setResult(null);
                    }}
                    placeholder="把你的答案写在这里（可以写过程，最后给出结果）……"
                    className="min-h-[100px] bg-[var(--card)] font-mono text-sm"
                  />
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  onClick={submit}
                  disabled={loading || !answer.trim()}
                  className="bg-[var(--blackboard)] text-[var(--chalk)] hover:bg-[var(--blackboard-2)]"
                >
                  {loading ? '判分中…' : '提交答案'}
                </Button>
                <Button
                  variant="outline"
                  onClick={next}
                  className="border-[var(--border)]"
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  下一题
                </Button>
                <span className="ml-auto text-[10px] text-[var(--ink-soft)]">
                  提示：方格老师不鼓励直接看答案，请先自己想一想。
                </span>
              </div>

              {result && (
                <div
                  className={[
                    'mt-5 rounded-md border p-4',
                    result.correct
                      ? 'border-[var(--correct)] bg-[var(--correct)]/8'
                      : 'border-[var(--red-pen)] bg-[var(--red-pen-soft)]',
                  ].join(' ')}
                >
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    {result.correct ? (
                      <>
                        <CheckIcon />
                        <span className="text-[var(--correct)]">
                          嗯，思路对了。
                        </span>
                      </>
                    ) : (
                      <>
                        <CrossIcon />
                        <span className="text-[var(--red-pen)]">
                          这一步还没走对，我们一起复盘。
                        </span>
                      </>
                    )}
                  </div>
                  <div className="tutor-markdown text-sm">
                    <p>
                      <strong>解析：</strong>
                      <MathInline content={result.analysis} />
                    </p>
                    {result.thinking && (
                      <p className="text-[var(--ink-soft)]">
                        <strong>用到的数学思想：</strong>
                        {result.thinking}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 右：AI 解题陪练 */}
        <div>
          <ChatPanel
            key={current?.id ?? 'empty'}
            module="practice"
            extraContext={
              current
                ? `当前题目：${current.stem}\n知识点：${current.chapterId} / ${current.pointId}\n难度：${current.difficulty}\n标准答案：${current.answer}（仅供老师内部参考，不要直接告诉学生）`
                : undefined
            }
            greeting="想做题前先聊聊思路？或者把你卡住的地方告诉我吧。"
            suggestions={[
              '我已知什么？要求什么？',
              '应该用哪个知识点？',
              '我先试试这个思路，对吗？',
            ]}
            height="78vh"
          />
        </div>
      </div>
    </AppShell>
  );
}

function CheckIcon() {
  return (
    <svg
      className="check-draw"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M5 12.5L10 17.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="cross-draw"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7 7L17 17"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M17 7L7 17"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        style={{ animationDelay: '0.18s' }}
      />
    </svg>
  );
}
