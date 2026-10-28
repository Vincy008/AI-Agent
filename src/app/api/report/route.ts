import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { CHAPTERS } from '@/lib/knowledge-data';

export const runtime = 'nodejs';

interface ReportItem {
  chapterId: string;
  total: number;
  correct: number;
}
interface ReportBody {
  items: ReportItem[];
  studentName?: string;
}

export async function POST(request: NextRequest) {
  let body: ReportBody;
  try {
    body = (await request.json()) as ReportBody;
  } catch {
    return NextResponse.json({ error: '请求体必须是合法 JSON' }, { status: 400 });
  }

  const { items, studentName = '同学' } = body;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items 不能为空' }, { status: 400 });
  }

  // 组装统计描述
  const chapterMap = new Map(CHAPTERS.map((c) => [c.id, c]));
  const lines = items.map((it) => {
    const c = chapterMap.get(it.chapterId);
    const rate = it.total > 0 ? Math.round((it.correct / it.total) * 100) : 0;
    return `- ${c ? `${c.grade}${c.term} · ${c.title}` : it.chapterId}：答对 ${it.correct} / ${it.total}，正确率 ${rate}%`;
  });

  const userPrompt = `以下是${studentName}最近的练习数据，请你（方格老师）给出一份不超过 250 字的能力分析报告，要求：
1. 指出至少 1 个亮点、1 个薄弱点。
2. 给出 2-3 条可执行的提升建议（写明先复习哪个知识点、再练哪类题）。
3. 语气克制温和，不使用"加油哦"等空话。

练习数据：
${lines.join('\n')}`;

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const resp = await client.invoke(
      [
        {
          role: 'system',
          content:
            '你是面向中国初中生的数学辅导老师「方格老师」，输出 Markdown，避免表情符号堆砌。',
        },
        { role: 'user', content: userPrompt },
      ],
      { model: 'doubao-seed-1-8-251228', temperature: 0.4 },
    );

    return NextResponse.json({
      success: true,
      report: resp.content,
      summary: items.map((it) => {
        const c = chapterMap.get(it.chapterId);
        return {
          chapterId: it.chapterId,
          chapterTitle: c?.title ?? it.chapterId,
          total: it.total,
          correct: it.correct,
          rate: it.total > 0 ? Math.round((it.correct / it.total) * 100) : 0,
        };
      }),
    });
  } catch (err) {
    // 无扣子运行时凭证时，降级为演示报告，保证 HR 看到完整 UI
    const demoReport = [
      '## 能力分析报告（演示模式）',
      '',
      `同学你好，基于你最近做的 ${items.length} 个章节的数据，这是一份示例报告：`,
      '',
      '### 亮点',
      '- 基础题正确率稳定，说明基本概念已经掌握。',
      '- 做题量持续，学习节奏不错。',
      '',
      '### 薄弱点',
      '- 综合题的正确率波动较大，可能是多知识点串联时思路断档。',
      '',
      '### 提升建议',
      '1. 先把错得最多的那章的知识点重新过一遍「直观演示 → 形式定义 → 反例」。',
      '2. 再做 5 道该章的提高题，重点写清每一步的依据。',
      '3. 三天后回来做一组同类拓展题验证。',
      '',
      '> 当前为静态演示，正式部署后此处会根据你的真实作答数据生成个性化报告。',
    ].join('\n');

    return NextResponse.json({
      success: true,
      report: demoReport,
      summary: items.map((it) => {
        const c = chapterMap.get(it.chapterId);
        return {
          chapterId: it.chapterId,
          chapterTitle: c?.title ?? it.chapterId,
          total: it.total,
          correct: it.correct,
          rate: it.total > 0 ? Math.round((it.correct / it.total) * 100) : 0,
        };
      }),
      demo: true,
    });
  }
}
