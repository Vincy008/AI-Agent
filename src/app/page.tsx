import Link from 'next/link';
import {
  BookOpen,
  ClipboardCheck,
  ListChecks,
  MessageSquareQuote,
  NotebookText,
  PenLine,
  ScrollText,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/shell';
import { CHAPTERS } from '@/lib/knowledge-data';
import { QUESTIONS } from '@/lib/questions-data';

const MODULES = [
  {
    href: '/chat',
    title: 'AI 对话辅导',
    desc: '什么不会都能问。方格老师不会直接给答案，会陪你一步步想。',
    icon: MessageSquareQuote,
    tag: '苏格拉底式',
  },
  {
    href: '/knowledge',
    title: '知识点学习',
    desc: '按章节系统讲解，直观演示 + 形式定义 + 类比反例三段式。',
    icon: BookOpen,
    tag: '七 / 八 / 九 年级',
  },
  {
    href: '/practice',
    title: '题目练习',
    desc: '基础 / 提高 / 拓展三档难度，按知识点筛选，做完立即反馈。',
    icon: PenLine,
    tag: '即时判分',
  },
  {
    href: '/mistakes',
    title: '错题分析',
    desc: '错题自动入本，AI 给出错因诊断 + 引导式正解 + 同类题。',
    icon: NotebookText,
    tag: '复盘',
  },
  {
    href: '/assessment',
    title: '能力测评',
    desc: '按章节做一组题，生成个性化能力分析报告与提升建议。',
    icon: ClipboardCheck,
    tag: 'AI 报告',
  },
  {
    href: '/homework',
    title: '作业辅导',
    desc: '把题目粘进来，或附上一张图片，AI 帮你看题、引导解题。',
    icon: ScrollText,
    tag: '支持图片',
  },
  {
    href: '/records',
    title: '学习记录',
    desc: '追踪做题量、正确率、错题分布，看见自己的成长曲线。',
    icon: ListChecks,
    tag: '本地保存',
  },
];

export default function HomePage() {
  const chapterCount = CHAPTERS.length;
  const pointCount = CHAPTERS.reduce((acc, c) => acc + c.points.length, 0);
  const questionCount = QUESTIONS.length;

  return (
    <AppShell title="工作台" subtitle="今天又是和数学交朋友的一天">
      {/* Hero */}
      <section className="paper-card mb-6 overflow-hidden">
        <div className="flex flex-col gap-6 px-7 py-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs text-[var(--accent-foreground)]">
              <Sparkles className="h-3 w-3" />
              <span>初中数学辅导 AI · 方格老师</span>
            </div>
            <h2 className="font-serif-cn text-2xl font-bold leading-snug text-[var(--ink)] md:text-3xl">
              不直接给你答案，
              <br className="hidden md:block" />
              而是陪你把思路一笔笔写出来。
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
              覆盖人教版 / 北师大版核心知识点，涵盖讲解、练习、错题、测评与作业辅导。
              用苏格拉底式提问代替「灌答案」，让你真正把方法装进脑子里。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/chat"
                className="rounded-md bg-[var(--blackboard)] px-4 py-2 text-sm font-medium text-[var(--chalk)] transition-colors hover:bg-[var(--blackboard-2)]"
              >
                开始问问题
              </Link>
              <Link
                href="/knowledge"
                className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--blackboard)]"
              >
                浏览知识点
              </Link>
            </div>
          </div>
          <div className="chalkboard rounded-lg p-5 md:w-[320px]">
            <div className="mb-3 text-xs opacity-80">— 今日小黑板 —</div>
            <div className="font-serif-cn text-lg leading-relaxed">
              「数学不是用脑子记的，
              <br />是用脑子想明白的。」
            </div>
            <div className="mt-4 flex justify-between border-t border-dashed border-[var(--chalk)]/30 pt-3 text-xs opacity-80">
              <span>章节</span>
              <span>{chapterCount}</span>
            </div>
            <div className="flex justify-between text-xs opacity-80">
              <span>知识点</span>
              <span>{pointCount}</span>
            </div>
            <div className="flex justify-between text-xs opacity-80">
              <span>题库</span>
              <span>{questionCount} 道</span>
            </div>
          </div>
        </div>
      </section>

      {/* 模块卡片 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="paper-card hover-rise group block px-6 py-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--blackboard)] text-[var(--chalk)]">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-[10px] text-[var(--ink-soft)]">{m.tag}</span>
              </div>
              <h3 className="font-serif-cn text-lg font-bold text-[var(--ink)] group-hover:text-[var(--blackboard)]">
                {m.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ink-soft)]">
                {m.desc}
              </p>
            </Link>
          );
        })}
      </section>

      {/* 教学策略 */}
      <section className="paper-card mt-6 px-7 py-6">
        <h3 className="font-serif-cn text-lg font-bold text-[var(--ink)]">
          方格老师的四大教学策略
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              t: '概念教学',
              d: '直观演示 → 实例讲解 → 类比拓展，把抽象数学讲成生活的语言。',
            },
            {
              t: '解题指导',
              d: '题干分析 → 知识点定位 → 典型解法 → 变式训练 → 错题复盘，五步推进。',
            },
            {
              t: '个性化辅导',
              d: '根据进度、薄弱点、错误类型动态调整下一道题的难度与方向。',
            },
            {
              t: '思维培养',
              d: '强调逻辑推理、分类讨论、数形结合、数学建模，不止于"答出来"。',
            },
          ].map((s) => (
            <div
              key={s.t}
              className="rounded-md border border-dashed border-[var(--border)] bg-[var(--paper)] p-4"
            >
              <div className="font-serif-cn text-base font-bold text-[var(--blackboard)]">
                {s.t}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ink-soft)]">
                {s.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
