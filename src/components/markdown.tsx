'use client';

import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Markdown + LaTeX 渲染器
 *
 * 支持：
 * - 标题（# / ## / ###）
 * - 加粗 **text**、斜体 *text*、行内 code `code`
 * - 列表（无序 / 有序）、引用块
 * - 段落 / 换行
 * - 行内数学公式 $...$（单美元符）
 * - 块级数学公式 $$...$$（双美元符）或独占一行的 $...$
 *
 * 使用 KaTeX 进行真正的数学公式渲染。
 */

interface MarkdownProps {
  content: string;
  className?: string;
  streaming?: boolean;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderTex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      output: 'html',
      trust: false,
    });
  } catch {
    return `<code>${escapeHtml(tex)}</code>`;
  }
}

/**
 * 提取行内公式：$...$（不跨行），先把 $$...$$ 块级抠出来。
 * 流程：
 *   1. 用占位符替换块级 $$...$$
 *   2. 转义 HTML
 *   3. 替换行内 $...$（必须配对，且不为空）
 *   4. 走 Markdown 行内格式（粗体 / 斜体 / 行内 code）
 *   5. 把占位符还原为 KaTeX 渲染结果
 */
function renderInline(text: string): string {
  const blocks: string[] = [];

  // 1. 行内代码先替换为占位（避免 code 内的 $ 被误识别）
  const codes: string[] = [];
  let s = text.replace(/`([^`]+)`/g, (_m, code: string) => {
    codes.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0001CODE${codes.length - 1}\u0001`;
  });

  // 2. 行内 KaTeX：$...$（避免误吃 \$，要求两侧不是反斜杠）
  s = s.replace(/(?<!\\)\$([^$\n]+?)(?<!\\)\$/g, (_m, tex: string) => {
    const html = renderTex(tex, false);
    blocks.push(html);
    return `\u0002KTX${blocks.length - 1}\u0002`;
  });

  // 3. 转义 HTML
  s = escapeHtml(s);

  // 4. Markdown 行内
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\\])\*([^*\n]+)\*/g, '$1<em>$2</em>');

  // 5. 还原占位符
  s = s.replace(/\u0001CODE(\d+)\u0001/g, (_m, i: string) => codes[Number(i)]);
  s = s.replace(/\u0002KTX(\d+)\u0002/g, (_m, i: string) => blocks[Number(i)]);

  // 6. 把转义后的反斜杠美元 \$ 恢复为 $
  s = s.replace(/\\\$/g, '$');

  return s;
}

interface Block {
  type: 'h' | 'p' | 'ul' | 'ol' | 'quote' | 'math';
  level?: number;
  text?: string;
  items?: string[];
  tex?: string;
}

function parseBlocks(content: string): Block[] {
  const lines = content.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 块级公式 $$...$$
    if (/^\s*\$\$/.test(line)) {
      // 单行 $$...$$ 或 多行
      const single = line.match(/^\s*\$\$(.+)\$\$\s*$/);
      if (single) {
        blocks.push({ type: 'math', tex: single[1] });
        i++;
        continue;
      }
      // 多行
      const buf: string[] = [];
      const start = line.replace(/^\s*\$\$/, '');
      if (start.trim()) buf.push(start);
      i++;
      while (i < lines.length && !/\$\$\s*$/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        const end = lines[i].replace(/\$\$\s*$/, '');
        if (end.trim()) buf.push(end);
        i++;
      }
      blocks.push({ type: 'math', tex: buf.join('\n') });
      continue;
    }

    // 标题
    if (/^#{1,3} /.test(line)) {
      const level = line.match(/^#+/)![0].length;
      blocks.push({ type: 'h', level, text: line.replace(/^#+\s*/, '') });
      i++;
      continue;
    }

    // 引用
    if (/^>\s?/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        items.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', text: items.join('\n') });
      continue;
    }

    // 无序列表
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // 有序列表
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // 空行
    if (line.trim() === '') {
      i++;
      continue;
    }

    // 段落（连续非空非特殊行）
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,3} /.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^\s*\$\$/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'p', text: paraLines.join('\n') });
  }

  return blocks;
}

function renderBlocks(blocks: Block[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'h': {
        const level = b.level ?? 2;
        out.push(`<h${level}>${renderInline(b.text ?? '')}</h${level}>`);
        break;
      }
      case 'quote': {
        const lines = (b.text ?? '').split('\n').map(renderInline).join('<br/>');
        out.push(`<blockquote>${lines}</blockquote>`);
        break;
      }
      case 'ul': {
        const items = (b.items ?? [])
          .map((i) => `<li>${renderInline(i)}</li>`)
          .join('');
        out.push(`<ul>${items}</ul>`);
        break;
      }
      case 'ol': {
        const items = (b.items ?? [])
          .map((i) => `<li>${renderInline(i)}</li>`)
          .join('');
        out.push(`<ol>${items}</ol>`);
        break;
      }
      case 'p': {
        const lines = (b.text ?? '').split('\n').map(renderInline).join('<br/>');
        out.push(`<p>${lines}</p>`);
        break;
      }
      case 'math': {
        out.push(
          `<div class="katex-block">${renderTex(b.tex ?? '', true)}</div>`,
        );
        break;
      }
    }
  }
  return out.join('\n');
}

export function Markdown({ content, className = '', streaming }: MarkdownProps) {
  const blocks = parseBlocks(content);
  const html = renderBlocks(blocks);

  return (
    <div
      className={`tutor-markdown ${streaming ? 'typing-cursor' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * 工具：把任意可能含公式的字符串渲染成行内 HTML（用于选项、题干等场景）。
 * 不当作完整段落处理，不加 <p>。
 */
export function MathInline({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  const html = renderInline(content);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
