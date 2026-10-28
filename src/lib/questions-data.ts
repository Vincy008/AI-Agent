/**
 * 练习题库（基础 / 提高 / 拓展）
 * 题目按知识点分类，包含选项、答案、解析、考查知识点
 */

export type Difficulty = 'basic' | 'medium' | 'advanced';

export interface Question {
  id: string;
  chapterId: string;
  pointId: string;
  difficulty: Difficulty;
  stem: string; // 题干（含 LaTeX）
  options?: string[]; // 单选；为空则为填空 / 解答题
  answer: string; // 选项字母 或 标准答案
  analysis: string;
  thinking: string; // 数学思想
}

export const QUESTIONS: Question[] = [
  // ===== 有理数 =====
  {
    id: 'q-rat-1',
    chapterId: 'g7-1-rational',
    pointId: 'g7-1-rational-2',
    difficulty: 'basic',
    stem: '已知 $|a| = 5$，则 $a$ 的值是（  ）',
    options: ['A. $5$', 'B. $-5$', 'C. $\\pm 5$', 'D. $0$'],
    answer: 'C',
    analysis:
      '绝对值是数轴上点到原点的距离，距离原点为 5 的数有两个：5 和 $-5$，所以 $a = \\pm 5$。',
    thinking: '分类讨论思想',
  },
  {
    id: 'q-rat-2',
    chapterId: 'g7-1-rational',
    pointId: 'g7-1-rational-2',
    difficulty: 'medium',
    stem: '若 $|x - 2| + |y + 3| = 0$，则 $x + y = $ ____',
    answer: '-1',
    analysis:
      '绝对值非负，两个非负数之和为 0，则两者均为 0：$x - 2 = 0, y + 3 = 0$，得 $x = 2, y = -3$，所以 $x + y = -1$。',
    thinking: '非负性 + 整体代换',
  },

  // ===== 一元一次方程 =====
  {
    id: 'q-le-1',
    chapterId: 'g7-2-linear-equation',
    pointId: 'g7-2-le-2',
    difficulty: 'basic',
    stem: '解方程：$3x - 5 = 2x + 7$',
    answer: 'x = 12',
    analysis: '移项：$3x - 2x = 7 + 5$，合并：$x = 12$。',
    thinking: '等式性质 + 移项',
  },
  {
    id: 'q-le-2',
    chapterId: 'g7-2-linear-equation',
    pointId: 'g7-2-le-2',
    difficulty: 'medium',
    stem: '解方程：$\\dfrac{x - 1}{2} - \\dfrac{2x + 1}{3} = 1$',
    answer: 'x = -11',
    analysis:
      '去分母（乘 6）：$3(x-1) - 2(2x+1) = 6$，去括号：$3x - 3 - 4x - 2 = 6$，合并：$-x - 5 = 6$，所以 $x = -11$。',
    thinking: '化归思想（分式 → 整式）',
  },

  // ===== 不等式 =====
  {
    id: 'q-ineq-1',
    chapterId: 'g7-2-inequality',
    pointId: 'g7-2-ineq-1',
    difficulty: 'basic',
    stem: '不等式 $-2x > 6$ 的解集是（  ）',
    options: ['A. $x > 3$', 'B. $x < 3$', 'C. $x > -3$', 'D. $x < -3$'],
    answer: 'D',
    analysis: '不等式两边同除以 $-2$，方向改变：$x < -3$。',
    thinking: '不等式性质（除以负数变号）',
  },

  // ===== 全等三角形 =====
  {
    id: 'q-tri-1',
    chapterId: 'g8-1-triangle',
    pointId: 'g8-1-tri-2',
    difficulty: 'medium',
    stem:
      '如图，$AB = AC$，$AD = AE$，$\\angle BAC = \\angle DAE$。求证：$\\triangle ABD \\cong \\triangle ACE$。',
    answer: 'SAS',
    analysis:
      '由 $\\angle BAC = \\angle DAE$，两边都减去 $\\angle DAC$，得 $\\angle BAD = \\angle CAE$。再结合 $AB = AC$ 和 $AD = AE$，由 SAS 可证 $\\triangle ABD \\cong \\triangle ACE$。',
    thinking: '等量代换 + 全等判定 (SAS)',
  },

  // ===== 勾股定理 =====
  {
    id: 'q-pyth-1',
    chapterId: 'g8-2-pythagoras',
    pointId: 'g8-2-pyth-1',
    difficulty: 'basic',
    stem: '直角三角形两直角边长分别为 $6$ 和 $8$，则斜边长为（  ）',
    options: ['A. $10$', 'B. $14$', 'C. $48$', 'D. $\\sqrt{14}$'],
    answer: 'A',
    analysis: '由勾股定理 $c = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$。',
    thinking: '直接应用勾股定理',
  },
  {
    id: 'q-pyth-2',
    chapterId: 'g8-2-pythagoras',
    pointId: 'g8-2-pyth-1',
    difficulty: 'advanced',
    stem:
      '直角三角形的一条直角边为 $5$，斜边为 $13$，则另一条直角边长为 ____',
    answer: '12',
    analysis: '另一直角边 $= \\sqrt{13^2 - 5^2} = \\sqrt{144} = 12$。',
    thinking: '勾股定理的逆向使用',
  },

  // ===== 一次函数 =====
  {
    id: 'q-lf-1',
    chapterId: 'g8-2-linear-fn',
    pointId: 'g8-2-lf-1',
    difficulty: 'medium',
    stem: '已知一次函数 $y = kx + 3$ 的图象经过点 $(2, 7)$，求 $k$ 的值。',
    answer: 'k = 2',
    analysis: '将 $(2, 7)$ 代入：$7 = 2k + 3$，解得 $k = 2$。',
    thinking: '待定系数法',
  },

  // ===== 一元二次方程 =====
  {
    id: 'q-qe-1',
    chapterId: 'g9-1-quadratic-eq',
    pointId: 'g9-1-qe-1',
    difficulty: 'basic',
    stem: '方程 $x^2 - 5x + 6 = 0$ 的解为（  ）',
    options: [
      'A. $x_1 = 2, x_2 = 3$',
      'B. $x_1 = -2, x_2 = -3$',
      'C. $x_1 = 1, x_2 = 6$',
      'D. $x_1 = -1, x_2 = -6$',
    ],
    answer: 'A',
    analysis: '因式分解：$(x - 2)(x - 3) = 0$，所以 $x_1 = 2, x_2 = 3$。',
    thinking: '因式分解法',
  },
  {
    id: 'q-qe-2',
    chapterId: 'g9-1-quadratic-eq',
    pointId: 'g9-1-qe-2',
    difficulty: 'advanced',
    stem:
      '已知 $x_1, x_2$ 是方程 $x^2 - 3x - 5 = 0$ 的两根，求 $x_1^2 + x_2^2$ 的值。',
    answer: '19',
    analysis:
      '由韦达定理：$x_1 + x_2 = 3, x_1 x_2 = -5$。$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2 x_1 x_2 = 9 + 10 = 19$。',
    thinking: '韦达定理 + 完全平方公式变形',
  },

  // ===== 二次函数 =====
  {
    id: 'q-qf-1',
    chapterId: 'g9-1-quadratic-fn',
    pointId: 'g9-1-qf-1',
    difficulty: 'medium',
    stem: '抛物线 $y = x^2 - 4x + 3$ 的顶点坐标是 ____',
    answer: '(2, -1)',
    analysis:
      '配方：$y = (x - 2)^2 - 1$，顶点为 $(2, -1)$。也可由公式 $x_0 = -\\frac{b}{2a} = 2$，$y_0 = -1$ 得到。',
    thinking: '配方法 / 顶点公式',
  },

  // ===== 相似三角形 =====
  {
    id: 'q-sim-1',
    chapterId: 'g9-2-similar',
    pointId: 'g9-2-sim-1',
    difficulty: 'advanced',
    stem:
      '若两个相似三角形的相似比为 $2 : 3$，则它们的面积比为（  ）',
    options: ['A. $2 : 3$', 'B. $4 : 9$', 'C. $\\sqrt{2} : \\sqrt{3}$', 'D. $8 : 27$'],
    answer: 'B',
    analysis: '相似三角形面积比 = 相似比的平方 = $4 : 9$。',
    thinking: '相似性质：边长比 / 面积比 / 体积比',
  },
];

export function getQuestionsByChapter(chapterId?: string): Question[] {
  if (!chapterId) return QUESTIONS;
  return QUESTIONS.filter((q) => q.chapterId === chapterId);
}

export function getQuestionsByDifficulty(d?: Difficulty): Question[] {
  if (!d) return QUESTIONS;
  return QUESTIONS.filter((q) => q.difficulty === d);
}

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  basic: '基础题',
  medium: '提高题',
  advanced: '拓展题',
};
