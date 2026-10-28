'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Brain,
  ClipboardCheck,
  Flame,
  GraduationCap,
  Home,
  ListChecks,
  MessageSquareQuote,
  NotebookText,
  PenLine,
  ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

const NAV: NavItem[] = [
  { href: '/', label: '工作台', icon: Home, desc: '今日学习概览' },
  { href: '/chat', label: 'AI 对话', icon: MessageSquareQuote, desc: '苏格拉底式答疑' },
  { href: '/knowledge', label: '知识点', icon: BookOpen, desc: '章节系统讲解' },
  { href: '/practice', label: '题目练习', icon: PenLine, desc: '分难度做题' },
  { href: '/mistakes', label: '错题本', icon: NotebookText, desc: '错题分析与复盘' },
  { href: '/assessment', label: '能力测评', icon: ClipboardCheck, desc: '掌握度报告' },
  { href: '/homework', label: '作业辅导', icon: ScrollText, desc: '图片/题目识题' },
  { href: '/records', label: '学习记录', icon: ListChecks, desc: '进度与正确率' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="chalkboard hidden h-screen w-[240px] flex-col gap-1 px-4 py-6 md:flex"
      style={{ position: 'sticky', top: 0 }}
    >
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--chalk)] text-[var(--blackboard)]">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <div className="font-serif-cn text-lg font-bold tracking-wide">
            方格 Math
          </div>
          <div className="text-xs opacity-75">初中数学辅导 AI</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {NAV.map((item, idx) => {
          const Icon = item.icon;
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname?.startsWith(item.href);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-[var(--blackboard-2)] text-[var(--chalk)] shadow-inner'
                    : 'text-[var(--chalk)]/80 hover:bg-[var(--blackboard-2)] hover:text-[var(--chalk)]',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="flex flex-col leading-tight">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[10px] opacity-60">{item.desc}</span>
                </div>
              </Link>
              {idx < NAV.length - 1 && (
                <div className="dashed-line mx-3 my-0.5 text-[var(--chalk)]" />
              )}
            </div>
          );
        })}
      </nav>

      <div className="rounded-md border border-[var(--chalk)]/20 bg-[var(--blackboard-2)]/40 p-3 text-xs">
        <div className="mb-1 flex items-center gap-1 text-[var(--chalk)]/90">
          <Brain className="h-3.5 w-3.5" />
          <span>今日提示</span>
        </div>
        <div className="text-[var(--chalk)]/70 leading-relaxed">
          慢一点没关系。题目最有用的部分，是你卡住的那一刻。
        </div>
      </div>
    </aside>
  );
}

interface TopbarProps {
  title: string;
  subtitle?: string;
  streakDays?: number;
}

export function Topbar({ title, subtitle, streakDays = 7 }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--paper)]/85 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="font-serif-cn text-xl font-bold text-[var(--ink)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[var(--ink-soft)]">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)]">
        <div className="flex items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1 text-[var(--accent-foreground)]">
          <Flame className="h-3.5 w-3.5" />
          <span>连续学习 {streakDays} 天</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--blackboard)] text-xs font-semibold text-[var(--chalk)]">
          学
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="grid-paper flex min-h-screen flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
