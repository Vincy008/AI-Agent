import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '方格 Math · 初中数学辅导 AI',
    template: '%s | 方格 Math',
  },
  description:
    '方格 Math 是面向初中生的数学辅导 AI Agent，提供知识讲解、苏格拉底式解题引导、错题分析、能力测评与作业辅导。',
  keywords: [
    '初中数学',
    'AI 数学辅导',
    '错题本',
    '能力测评',
    '作业辅导',
    '苏格拉底式教学',
  ],
  authors: [{ name: '方格 Math' }],
  // icons: {
  //   icon: '',
  // },
  openGraph: {
    title: '方格 Math · 初中数学辅导 AI',
    description:
      '面向初中生的数学辅导 AI，耐心的苏格拉底式引导，让学生自己学会解题。',
    siteName: '方格 Math',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
