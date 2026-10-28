import { AppShell } from '@/components/shell';
import { ChatPanel } from '@/components/chat-panel';

export const metadata = {
  title: 'AI 对话辅导',
};

export default function ChatPage() {
  return (
    <AppShell
      title="AI 对话辅导"
      subtitle="苏格拉底式引导：先问你怎么想，再陪你一步步推。"
    >
      <ChatPanel
        module="chat"
        greeting={`你好，我是**方格老师**。

把你不懂的题目或概念告诉我吧——别担心，我**不会一上来就给你答案**，而是先陪你一起想。

你想从哪里开始？`}
        suggestions={[
          '帮我讲一下二次函数的顶点公式',
          '我做这道题：解方程 2x − 3 = 5x + 9',
          '勾股定理的逆定理怎么用？',
          '为什么不等式两边乘负数要变号？',
        ]}
        height="74vh"
      />
    </AppShell>
  );
}
