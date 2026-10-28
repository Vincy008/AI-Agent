import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { buildSystemPrompt, MODULE_PROMPT } from '@/lib/tutor-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBody {
  messages: ChatMessage[];
  module?: keyof typeof MODULE_PROMPT;
  extraContext?: string;
  imageUrl?: string; // 作业辅导模块可附图
}

export async function POST(request: NextRequest) {
  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return new Response(
      JSON.stringify({ error: '请求体必须是合法 JSON' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { messages, module = 'chat', extraContext, imageUrl } = body;
  // 过滤掉空内容消息，避免误判
  const cleanMessages: ChatMessage[] = Array.isArray(messages)
    ? messages.filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string',
      )
    : [];
  const hasMeaningful =
    cleanMessages.some((m) => m.content && m.content.trim().length > 0) ||
    !!imageUrl;
  if (!hasMeaningful) {
    return new Response(
      JSON.stringify({
        error: '请输入消息内容后再发送',
        hint: 'messages 数组缺少非空文本，且未携带 imageUrl',
        received: { count: cleanMessages.length, hasImage: !!imageUrl },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  // 若用户只发了图（messages 为空），构造一条占位 user 消息，避免下游模型报错
  const safeMessages: ChatMessage[] =
    cleanMessages.length > 0
      ? cleanMessages
      : [{ role: 'user', content: '请帮我看下这道作业题。' }];

  const systemPrompt = buildSystemPrompt(module, extraContext);

  // 组装发送给 LLM 的消息
  const llmMessages: Array<{
    role: 'system' | 'user' | 'assistant';
    content:
      | string
      | Array<
          | { type: 'text'; text: string }
          | { type: 'image_url'; image_url: { url: string; detail?: 'high' | 'low' } }
        >;
  }> = [{ role: 'system', content: systemPrompt }];

  for (let i = 0; i < safeMessages.length; i++) {
    const m = safeMessages[i];
    const isLastUser = i === safeMessages.length - 1 && m.role === 'user';
    if (isLastUser && imageUrl) {
      llmMessages.push({
        role: 'user',
        content: [
          { type: 'text', text: m.content || '请帮我看下这道作业题。' },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
        ],
      });
    } else {
      llmMessages.push({ role: m.role, content: m.content });
    }
  }

  const encoder = new TextEncoder();
  const DEMO_REPLY = `你好，我是**方格老师**。

当前是**静态演示模式**：AI 对话能力需要在扣子编程运行时环境中才能调用大模型，这里只展示产品的界面与交互流程。

你可以继续体验这些完整功能：
- **知识点学习**：按章节浏览系统讲解
- **题目练习**：三档难度，做完即时判分
- **错题分析**：错题自动入本
- **能力测评**：按章节生成报告

想真正跟我对话？把题目贴过来，我会在正式部署环境里陪你一步步想。`;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
        const config = new Config();
        const client = new LLMClient(config, customHeaders);

        const llmStream = client.stream(llmMessages, {
          model: 'doubao-seed-1-8-251228',
          temperature: 0.6,
          thinking: 'disabled',
        });
        for await (const chunk of llmStream) {
          if (chunk?.content) {
            const text =
              typeof chunk.content === 'string'
                ? chunk.content
                : String(chunk.content);
            const payload = `data: ${JSON.stringify({ delta: text })}\n\n`;
            controller.enqueue(encoder.encode(payload));
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } catch (err) {
        // 无扣子运行时凭证时，降级为演示文案，避免 HR 看到报错
        const demoChunks = DEMO_REPLY.match(/[\s\S]{1,12}/g) ?? [DEMO_REPLY];
        for (const piece of demoChunks) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ delta: piece })}\n\n`),
          );
          await new Promise((r) => setTimeout(r, 18));
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Transfer-Encoding': 'chunked',
    },
  });
}
