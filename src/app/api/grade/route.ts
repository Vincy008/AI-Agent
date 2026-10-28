import { NextRequest, NextResponse } from 'next/server';
import { getQuestionById } from '@/lib/questions-data';

export const runtime = 'nodejs';

interface GradeBody {
  questionId: string;
  userAnswer: string;
}

/**
 * 题目即时判分（不调用 LLM，保证毫秒级反馈）
 * - 选项题：比较字母（不区分大小写、去前缀）
 * - 填空题：归一化空白与中英文符号后比较
 */
function normalize(s: string): string {
  return s
    .replace(/\s+/g, '')
    .replace(/，/g, ',')
    .replace(/；/g, ';')
    .replace(/。/g, '.')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/：/g, ':')
    .trim()
    .toLowerCase();
}

function extractOptionLetter(s: string): string {
  // 接受 "A"、"a"、"A."、"A、" 等输入
  const m = s.trim().match(/^[A-Da-d]/);
  return m ? m[0].toUpperCase() : '';
}

export async function POST(request: NextRequest) {
  let body: GradeBody;
  try {
    body = (await request.json()) as GradeBody;
  } catch {
    return NextResponse.json({ error: '请求体必须是合法 JSON' }, { status: 400 });
  }

  const { questionId, userAnswer } = body;
  if (!questionId || typeof userAnswer !== 'string') {
    return NextResponse.json(
      { error: '需要提供 questionId 与 userAnswer' },
      { status: 400 },
    );
  }

  const q = getQuestionById(questionId);
  if (!q) {
    return NextResponse.json({ error: '题目不存在' }, { status: 404 });
  }

  let correct = false;
  if (q.options && q.options.length > 0) {
    correct = extractOptionLetter(userAnswer) === q.answer.toUpperCase();
  } else {
    correct = normalize(userAnswer) === normalize(q.answer);
  }

  return NextResponse.json({
    success: true,
    correct,
    answer: q.answer,
    analysis: q.analysis,
    thinking: q.thinking,
  });
}
