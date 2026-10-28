'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MODULE_PROMPT } from '@/lib/tutor-prompt';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type ModuleKey = keyof typeof MODULE_PROMPT;

let _seq = 0;
const genId = (suffix: string) => {
  _seq += 1;
  return `${Date.now()}-${_seq}-${suffix}`;
};

export function useTutorChat(options: {
  module?: ModuleKey;
  initial?: ChatMessage[];
  extraContext?: string;
}) {
  const { module = 'chat', initial = [], extraContext } = options;
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 用 ref 同步追踪最新 messages，避免 setState 闭包时序问题（React 18 并发渲染下不可靠）
  const messagesRef = useRef<ChatMessage[]>(initial);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const send = useCallback(
    async (text: string, imageUrl?: string) => {
      const trimmed = text.trim();
      if (!trimmed && !imageUrl) return;
      if (abortRef.current) {
        // 防止重复触发
        return;
      }
      setError(null);

      const userMsg: ChatMessage = {
        id: genId('u'),
        role: 'user',
        content: trimmed || (imageUrl ? '请帮我看下这道作业题。' : ''),
      };
      const aiMsg: ChatMessage = {
        id: genId('a'),
        role: 'assistant',
        content: '',
      };

      // 1. 先用 ref 拿到最新历史并立即构造 payload（不依赖 setState 闭包时序）
      const history = messagesRef.current;
      const payloadMessages = [...history, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // 2. 同步更新 ref + 异步更新 React 状态用于 UI
      const nextState = [...history, userMsg, aiMsg];
      messagesRef.current = nextState;
      setMessages(nextState);

      // 3. 防御性兜底：如果实在拿不到任何用户消息内容，直接给 UI 提示，不发请求
      if (
        payloadMessages.length === 0 ||
        !payloadMessages.some(
          (m) => (m.role === 'user' && m.content.trim()) || imageUrl,
        )
      ) {
        setError('请先输入内容再发送');
        const errState = nextState.map((m) =>
          m.id === aiMsg.id ? { ...m, content: '（请先输入内容再发送）' } : m,
        );
        messagesRef.current = errState;
        setMessages(errState);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setStreaming(true);

      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: payloadMessages,
            module,
            extraContext,
            imageUrl,
          }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) {
          const errText = await resp.text().catch(() => '');
          let parsed = errText;
          try {
            const obj = JSON.parse(errText) as { error?: string };
            if (obj?.error) parsed = obj.error;
          } catch {
            /* noop */
          }
          throw new Error(parsed || `HTTP ${resp.status}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith('data:')) continue;
            const json = line.slice(5).trim();
            if (!json) continue;
            try {
              const obj = JSON.parse(json) as {
                delta?: string;
                error?: string;
                done?: boolean;
              };
              if (obj.error) {
                throw new Error(obj.error);
              }
              if (obj.delta) {
                accumulated += obj.delta;
                const updated = messagesRef.current.map((m) =>
                  m.id === aiMsg.id ? { ...m, content: accumulated } : m,
                );
                messagesRef.current = updated;
                setMessages(updated);
              }
            } catch (e) {
              if (e instanceof Error && e.message) throw e;
            }
          }
        }
      } catch (e) {
        if ((e as { name?: string })?.name === 'AbortError') {
          return;
        }
        const msg = e instanceof Error ? e.message : '出错了';
        setError(msg);
        const errState = messagesRef.current.map((m) =>
          m.id === aiMsg.id ? { ...m, content: `（出错：${msg}）` } : m,
        );
        messagesRef.current = errState;
        setMessages(errState);
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [module, extraContext],
  );

  const reset = useCallback((to: ChatMessage[] = []) => {
    messagesRef.current = to;
    setMessages(to);
    setError(null);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  return { messages, send, streaming, error, reset, stop };
}
