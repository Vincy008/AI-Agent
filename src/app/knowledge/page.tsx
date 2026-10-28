'use client';

import { useMemo, useState } from 'react';
import { AppShell } from '@/components/shell';
import { ChatPanel } from '@/components/chat-panel';
import { MathInline } from '@/components/markdown';
import { CHAPTERS, type KnowledgeChapter } from '@/lib/knowledge-data';

const GRADE_TABS: Array<'全部' | '七年级' | '八年级' | '九年级'> = [
  '全部',
  '七年级',
  '八年级',
  '九年级',
];

export default function KnowledgePage() {
  const [grade, setGrade] = useState<(typeof GRADE_TABS)[number]>('全部');
  const [activeId, setActiveId] = useState<string>(CHAPTERS[0].id);

  const chapters = useMemo(
    () =>
      grade === '全部'
        ? CHAPTERS
        : CHAPTERS.filter((c) => c.grade === grade),
    [grade],
  );

  const active: KnowledgeChapter =
    chapters.find((c) => c.id === activeId) ?? chapters[0] ?? CHAPTERS[0];

  return (
    <AppShell
      title="知识点学习"
      subtitle="覆盖人教版 / 北师大版核心章节，按章节系统讲解"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {GRADE_TABS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGrade(g);
              const next =
                g === '全部'
                  ? CHAPTERS[0]
                  : CHAPTERS.find((c) => c.grade === g);
              if (next) setActiveId(next.id);
            }}
            className={[
              'rounded-full border px-3 py-1 text-xs transition-colors',
              grade === g
                ? 'border-[var(--blackboard)] bg-[var(--blackboard)] text-[var(--chalk)]'
                : 'border-[var(--border)] bg-[var(--card)] text-[var(--ink-soft)] hover:border-[var(--blackboard)] hover:text-[var(--blackboard)]',
            ].join(' ')}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_400px]">
        {/* 左：章节列表 */}
        <div className="paper-card max-h-[78vh] overflow-y-auto p-2">
          {chapters.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={[
                'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                c.id === active.id
                  ? 'bg-[var(--blackboard)] text-[var(--chalk)]'
                  : 'text-[var(--ink)] hover:bg-[var(--muted)]',
              ].join(' ')}
            >
              <div className="text-xs opacity-70">
                {c.grade} · {c.term}
              </div>
              <div className="font-serif-cn font-medium">{c.title}</div>
            </button>
          ))}
        </div>

        {/* 中：章节详情 */}
        <div className="paper-card max-h-[78vh] space-y-5 overflow-y-auto p-6">
          <div>
            <div className="text-xs text-[var(--ink-soft)]">
              {active.grade} · {active.term}册
            </div>
            <h2 className="font-serif-cn text-2xl font-bold text-[var(--ink)]">
              {active.title}
            </h2>
          </div>
          {active.points.map((p) => (
            <div
              key={p.id}
              className="rounded-md border border-dashed border-[var(--border)] bg-[var(--paper)] p-4"
            >
              <h3 className="font-serif-cn text-base font-bold text-[var(--blackboard)]">
                {p.title}
              </h3>
              <p className="mt-2 font-serif-cn text-sm leading-relaxed text-[var(--ink)]">
                <MathInline content={p.summary} />
              </p>
              {p.formulas && p.formulas.length > 0 && (
                <div className="mt-3 rounded bg-[var(--card)] p-3 text-sm text-[var(--ink)]">
                  {p.formulas.map((f, i) => (
                    <div key={i} className="py-0.5">
                      <MathInline content={f} />
                    </div>
                  ))}
                </div>
              )}
              {p.examples && p.examples.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-[var(--ink-soft)]">示例</div>
                  <ul className="mt-1 list-disc pl-5 text-xs text-[var(--ink)]">
                    {p.examples.map((e, i) => (
                      <li key={i}>
                        <MathInline content={e} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {p.tips && p.tips.length > 0 && (
                <div className="mt-3 rounded border-l-2 border-[var(--hint)] bg-[var(--accent)]/40 p-2 text-xs">
                  <div className="font-semibold text-[var(--accent-foreground)]">
                    易错提醒
                  </div>
                  <ul className="mt-1 list-disc pl-4 text-[var(--ink)]">
                    {p.tips.map((t, i) => (
                      <li key={i}>
                        <MathInline content={t} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 右：针对当前章节的 AI 讲解 */}
        <div>
          <ChatPanel
            key={active.id}
            module="knowledge"
            extraContext={`学生当前正在学习「${active.grade}${active.term} · ${active.title}」章节，包含知识点：${active.points
              .map((p) => p.title)
              .join('、')}。`}
            greeting={`我们一起来看「**${active.title}**」吧。你想先理解哪个小节，或者你有具体的例题吗？`}
            suggestions={active.points.map((p) => `帮我讲讲：${p.title}`)}
            height="78vh"
            framed={true}
          />
        </div>
      </div>
    </AppShell>
  );
}
