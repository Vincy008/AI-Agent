'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AppShell } from '@/components/shell';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Markdown, MathInline } from '@/components/markdown';
import { CHAPTERS } from '@/lib/knowledge-data';
import {
  DIFFICULTY_LABEL,
  QUESTIONS,
  type Question,
} from '@/lib/questions-data';
import {
  loadAttempts,
  saveAttempt,
  statsByChapter,
} from '@/lib/record-store';

interface ReportItem {
  chapterId: string;
  chapterTitle: string;
  total: number;
  correct: number;
  rate: number;
}

interface ReportResponse {
  success?: boolean;
  report?: string;
  summary?: ReportItem[];
  error?: string;
}

function pickAssessmentQuestions(chapterId: string): Question[] {
  if (chapterId === 'all') {
    // 全部章节：每章随机 1 道
    const map = new Map<string, Question>();
    for (const q of QUESTIONS) {
      if (!map.has(q.chapterId)) map.set(q.chapterId, q);
    }
    return Array.from(map.values()).slice(0, 8);
  }
  return QUESTIONS.filter((q) => q.chapterId === chapterId);
}

export default function AssessmentPage() {
  const [chapterId, setChapterId] = useState<string>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState<Array<{ q: Question; correct: boolean; userAnswer: string }>>([]);
  const [phase, setPhase] = useState<'idle' | 'testing' | 'done'>('idle');
  const [report, setReport] = useState<string>('');
  const [summary, setSummary] = useState<ReportItem[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const startTest = () => {
    const qs = pickAssessmentQuestions(chapterId);
    if (qs.length === 0) return;
    setQuestions(qs);
    setIdx(0);
    setAnswer('');
    setResults([]);
    setPhase('testing');
    setReport('');
    setReportError(null);
  };

  const submitAnswer = async () => {
    const q = questions[idx];
    if (!q || !answer.trim()) return;
    const resp = await fetch('/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: q.id, userAnswer: answer }),
    });
    const data = await resp.json();
    const correct = !!data.correct;
    setResults((r) => [...r, { q, correct, userAnswer: answer }]);
    saveAttempt({
      questionId: q.id,
      chapterId: q.chapterId,
      pointId: q.pointId,
      difficulty: q.difficulty,
      stem: q.stem,
      correct,
      userAnswer: answer,
      answer: data.answer,
      analysis: data.analysis,
      thinking: data.thinking,
    });
    setAnswer('');
    if (idx + 1 >= questions.length) {
      setPhase('done');
      void generateReport([...results, { q, correct, userAnswer: answer }]);
    } else {
      setIdx(idx + 1);
    }
  };

  const generateReport = async (
    items: Array<{ q: Question; correct: boolean }>,
  ) => {
    setReportLoading(true);
    setReportError(null);
    // 合并到本次测评 + 历史所有
    const map = new Map<string, { total: number; correct: number }>();
    for (const it of items) {
      const cur = map.get(it.q.chapterId) ?? { total: 0, correct: 0 };
      cur.total += 1;
      if (it.correct) cur.correct += 1;
      map.set(it.q.chapterId, cur);
    }
    const payloadItems = Array.from(map.entries()).map(([cid, v]) => ({
      chapterId: cid,
      total: v.total,
      correct: v.correct,
    }));

    try {
      const resp = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems }),
      });
      const data: ReportResponse = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error ?? '生成报告失败');
      }
      setReport(data.report ?? '');
      setSummary(data.summary ?? []);
    } catch (e) {
      setReportError(e instanceof Error ? e.message : '生成报告失败');
    } finally {
      setReportLoading(false);
    }
  };

  // 历史数据展示
  const [historyStats, setHistoryStats] = useState<ReportItem[]>([]);
  useEffect(() => {
    const list = loadAttempts();
    const stats = statsByChapter(list);
    setHistoryStats(
      stats.map((s) => ({
        chapterId: s.chapterId,
        chapterTitle:
          CHAPTERS.find((c) => c.id === s.chapterId)?.title ?? s.chapterId,
        total: s.total,
        correct: s.correct,
        rate: Math.round((s.correct / s.total) * 100),
      })),
    );
  }, [phase]);

  const currentQ = questions[idx];
  const progress = useMemo(
    () => (questions.length ? Math.round(((idx + (phase === 'done' ? 1 : 0)) / questions.length) * 100) : 0),
    [idx, questions, phase],
  );

  return (
    <AppShell
      title="能力测评"
      subtitle="完成一组诊断题，AI 自动生成可执行的提升建议"
    >
      {phase === 'idle' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          <div className="paper-card p-6">
            <h2 className="font-serif-cn text-xl font-bold text-[var(--ink)]">
              开始一次测评
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              选择要测评的章节，方格老师会根据你的答题情况给出能力分析与提升建议。
              测评数据也会同步保存到「学习记录」。
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-xs text-[var(--ink-soft)]">章节：</span>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm"
              >
                <option value="all">综合（覆盖各章节）</option>
                {CHAPTERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.grade}{c.term} · {c.title}
                  </option>
                ))}
              </select>
              <Button
                onClick={startTest}
                className="bg-[var(--blackboard)] text-[var(--chalk)] hover:bg-[var(--blackboard-2)]"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                开始测评
              </Button>
            </div>
          </div>

          <div className="paper-card p-6">
            <h3 className="font-serif-cn text-base font-bold text-[var(--ink)]">
              历史掌握度
            </h3>
            {historyStats.length === 0 ? (
              <p className="mt-3 text-xs text-[var(--ink-soft)]">
                还没有数据，做完题或测评后这里会显示。
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {historyStats.map((s) => (
                  <div key={s.chapterId}>
                    <div className="flex justify-between text-xs text-[var(--ink-soft)]">
                      <span>{s.chapterTitle}</span>
                      <span>
                        {s.correct} / {s.total} · {s.rate}%
                      </span>
                    </div>
                    <Progress value={s.rate} className="mt-1 h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'testing' && currentQ && (
        <div className="paper-card mx-auto max-w-3xl p-6">
          <div className="mb-3 flex items-center justify-between text-xs text-[var(--ink-soft)]">
            <span>
              第 {idx + 1} / {questions.length} 题 ·{' '}
              {CHAPTERS.find((c) => c.id === currentQ.chapterId)?.title}
            </span>
            <span>{DIFFICULTY_LABEL[currentQ.difficulty]}</span>
          </div>
          <Progress value={Math.round(((idx) / questions.length) * 100)} className="h-1.5" />
          <div className="tutor-markdown mt-5">
            <p>
              <strong>题目：</strong>
              <MathInline content={currentQ.stem} />
            </p>
          </div>
          {currentQ.options ? (
            <div className="mt-4 space-y-2">
              {currentQ.options.map((opt) => (
                <label
                  key={opt}
                  className={[
                    'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm',
                    answer.trim().toUpperCase().startsWith(opt[0])
                      ? 'border-[var(--blackboard)] bg-[var(--accent)]/30'
                      : 'border-[var(--border)] bg-[var(--card)]',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="opt"
                    checked={answer.trim().toUpperCase().startsWith(opt[0])}
                    onChange={() => setAnswer(opt[0])}
                    className="accent-[var(--blackboard)]"
                  />
                  <MathInline content={opt} />
                </label>
              ))}
            </div>
          ) : (
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="把你的答案填在这里"
              className="mt-4 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 font-mono text-sm"
            />
          )}

          <div className="mt-5 flex justify-end">
            <Button
              onClick={submitAnswer}
              disabled={!answer.trim()}
              className="bg-[var(--blackboard)] text-[var(--chalk)] hover:bg-[var(--blackboard-2)]"
            >
              {idx + 1 === questions.length ? '完成测评' : '下一题'}
            </Button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="space-y-4">
          <div className="paper-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-cn text-xl font-bold text-[var(--ink)]">
                  测评完成
                </h2>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  共 {questions.length} 题，答对{' '}
                  {results.filter((r) => r.correct).length} 题
                </p>
              </div>
              <Button
                onClick={startTest}
                variant="outline"
                className="border-[var(--border)]"
              >
                再来一次
              </Button>
            </div>
            <Progress value={progress} className="mt-3 h-1.5" />
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={[
                    'rounded-md border p-3 text-xs',
                    r.correct
                      ? 'border-[var(--correct)] bg-[var(--correct)]/8'
                      : 'border-[var(--red-pen)] bg-[var(--red-pen-soft)]',
                  ].join(' ')}
                >
                  <div className="text-[10px] text-[var(--ink-soft)]">
                    第 {i + 1} 题 · {DIFFICULTY_LABEL[r.q.difficulty]}
                  </div>
                  <div className="mt-0.5 line-clamp-2 font-serif-cn text-[var(--ink)]">
                    <MathInline content={r.q.stem} />
                  </div>
                  <div className="mt-1 text-[var(--ink-soft)]">
                    {r.correct ? '✅ 答对了' : `❌ 你答：${r.userAnswer} · 正解：${r.q.answer}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="paper-card p-6">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--blackboard)]" />
              <h3 className="font-serif-cn text-base font-bold text-[var(--ink)]">
                方格老师的能力分析
              </h3>
            </div>
            {reportLoading && (
              <p className="text-sm text-[var(--ink-soft)]">报告生成中……</p>
            )}
            {reportError && (
              <p className="text-sm text-[var(--red-pen)]">{reportError}</p>
            )}
            {report && <Markdown content={report} />}

            {summary.length > 0 && (
              <div className="mt-5 space-y-2">
                {summary.map((s) => (
                  <div key={s.chapterId}>
                    <div className="flex justify-between text-xs text-[var(--ink-soft)]">
                      <span>{s.chapterTitle}</span>
                      <span>
                        {s.correct} / {s.total} · {s.rate}%
                      </span>
                    </div>
                    <Progress value={s.rate} className="mt-1 h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
