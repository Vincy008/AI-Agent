'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { AppShell } from '@/components/shell';
import { ChatPanel } from '@/components/chat-panel';
import { Button } from '@/components/ui/button';

export default function HomeworkPage() {
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [imageName, setImageName] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('图片不能超过 4MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setImageDataUrl(result);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <AppShell
      title="作业辅导"
      subtitle="把题目粘进来，或拍张照片上传，方格老师陪你一步步思考"
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        {/* 左：图片上传区 */}
        <div className="paper-card p-5">
          <h3 className="font-serif-cn text-base font-bold text-[var(--ink)]">
            上传题目图片（可选）
          </h3>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            支持 JPG / PNG，最大 4 MB。也可以直接在右侧输入题目文字。
          </p>
          {imageDataUrl ? (
            <div className="mt-4 space-y-2">
              <div className="relative overflow-hidden rounded-md border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageDataUrl}
                  alt={imageName}
                  className="max-h-[320px] w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageDataUrl('');
                    setImageName('');
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="absolute right-2 top-2 rounded-full bg-[var(--ink)]/70 p-1 text-[var(--chalk)]"
                  aria-label="移除"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-[10px] text-[var(--ink-soft)] truncate">
                {imageName}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-4 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[var(--border)] bg-[var(--paper)] text-sm text-[var(--ink-soft)] transition-colors hover:border-[var(--blackboard)] hover:text-[var(--blackboard)]"
            >
              <ImagePlus className="h-6 w-6" />
              <span>点击上传题目图片</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPick}
            className="hidden"
          />

          <div className="mt-5 space-y-2 rounded-md border border-dashed border-[var(--border)] bg-[var(--paper)] p-3 text-xs text-[var(--ink-soft)]">
            <div className="font-semibold text-[var(--blackboard)]">
              老师怎么辅导你
            </div>
            <ol className="ml-3 list-decimal space-y-0.5">
              <li>先读题，把已知和要求复述给你听</li>
              <li>定位到具体的知识点</li>
              <li>给提示一，让你试一试</li>
              <li>不会就再给提示二、提示三</li>
              <li>最后写出完整步骤 + 易错点</li>
            </ol>
          </div>

          {imageDataUrl && (
            <div className="mt-4 rounded-md bg-[var(--accent)]/40 p-3 text-xs text-[var(--accent-foreground)]">
              已附图，发送时 AI 会读图理解题目。
            </div>
          )}

          <div className="mt-3 flex">
            <Button
              variant="outline"
              size="sm"
              className="ml-auto border-[var(--border)]"
              onClick={() => {
                setImageDataUrl('');
                setImageName('');
                if (fileRef.current) fileRef.current.value = '';
              }}
              disabled={!imageDataUrl}
            >
              清除图片
            </Button>
          </div>
        </div>

        {/* 右：对话面板 */}
        <div>
          <ChatPanel
            module="homework"
            imageUrl={imageDataUrl || undefined}
            greeting={`把作业题告诉我吧（可以是文字、或者**点左边上传图片**）。

我会先帮你读题、定位知识点，然后给你**第一层提示**——别担心，做不出来我会一层层往下提示。`}
            suggestions={[
              '我把题目打字给你看',
              '我已经上传图片了，请帮我读题',
              '我做到一半卡住了，先给我一个小提示',
            ]}
            height="78vh"
          />
        </div>
      </div>
    </AppShell>
  );
}
