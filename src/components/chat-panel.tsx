'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Markdown } from '@/components/markdown';
import { useTutorChat, type ChatMessage } from '@/hooks/use-tutor-chat';
import type { MODULE_PROMPT } from '@/lib/tutor-prompt';

interface ChatPanelProps {
  module?: keyof typeof MODULE_PROMPT;
  extraContext?: string;
  initial?: ChatMessage[];
  greeting?: string;
  placeholder?: string;
  suggestions?: string[];
  imageUrl?: string;
  className?: string;
  /** 是否在内部加 paper-card 容器，默认 true */
  framed?: boolean;
  /** 高度（默认 75vh） */
  height?: string;
}

export function ChatPanel({
  module = 'chat',
  extraContext,
  initial,
  greeting,
  placeholder = '把题目或问题告诉方格老师……',
  suggestions = [],
  imageUrl,
  className = '',
  framed = true,
  height = '70vh',
}: ChatPanelProps) {
  const initialMessages: ChatMessage[] =
    initial ??
    (greeting
      ? [{ id: 'greet', role: 'assistant', content: greeting }]
      : []);

  const { messages, send, streaming, stop } = useTutorChat({
    module,
    extraContext,
    initial: initialMessages,
  });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || streaming) return;
    const text = input;
    setInput('');
    await send(text, imageUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleSuggest = (s: string) => {
    if (streaming) return;
    void send(s, imageUrl);
  };

  const containerClass = framed
    ? 'paper-card flex flex-col overflow-hidden bg-[var(--card)]'
    : 'flex flex-col overflow-hidden';

  return (
    <div
      className={`${containerClass} ${className}`}
      style={{ height }}
    >
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-[var(--ink-soft)]">
            <Sparkles className="mb-3 h-8 w-8 text-[var(--blackboard)]" />
            <p className="font-serif-cn text-base">和方格老师聊聊吧</p>
            <p className="mt-1 text-xs">老师不会直接给你答案，会陪你一起想。</p>
          </div>
        )}
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={[
                  'max-w-[88%] rounded-lg px-4 py-3 text-sm',
                  isUser
                    ? 'bg-[var(--blackboard)] text-[var(--chalk)] rounded-tr-sm font-sans-cn'
                    : 'bg-[var(--card)] border border-[var(--border)] rounded-tl-sm',
                ].join(' ')}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                ) : (
                  <Markdown
                    content={m.content || '思考中…'}
                    streaming={streaming && m.id === messages[messages.length - 1]?.id}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {suggestions.length > 0 && messages.length <= (greeting ? 1 : 0) && (
        <div className="flex flex-wrap gap-2 border-t border-[var(--border)] px-5 py-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggest(s)}
              className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--ink-soft)] transition-colors hover:border-[var(--blackboard)] hover:text-[var(--blackboard)]"
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-[var(--border)] bg-[var(--paper)]/50 p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[52px] max-h-[160px] resize-none bg-[var(--card)] font-sans-cn text-sm"
          />
          {streaming ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={stop}
              title="停止"
              className="border-[var(--border)]"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim()}
              size="icon"
              className="bg-[var(--blackboard)] text-[var(--chalk)] hover:bg-[var(--blackboard-2)]"
              title="发送"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-1 px-1 text-[10px] text-[var(--ink-soft)]">
          Enter 发送，Shift + Enter 换行。老师以引导为主，避免直接给答案。
        </div>
      </div>
    </div>
  );
}
