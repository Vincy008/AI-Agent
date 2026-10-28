/**
 * 初中数学知识点（人教版 + 北师大版核心交集）
 * 用于「知识点学习」与「题目练习」模块。
 */

export interface KnowledgePoint {
  id: string;
  title: string;
  summary: string;
  formulas?: string[];
  examples?: string[];
  tips?: string[];
}

export interface KnowledgeChapter {
  id: string;
  grade: '七年级' | '八年级' | '九年级';
  term: '上' | '下';
  title: string;
  points: KnowledgePoint[];
}

export const CHAPTERS: KnowledgeChapter[] = [
  {
    id: 'g7-1-rational',
    grade: '七年级',
    term: '上',
    title: '有理数',
    points: [
      {
        id: 'g7-1-rational-1',
        title: '有理数的概念与分类',
        summary:
          '整数和分数统称为有理数。按符号可分为正有理数、零、负有理数；按结构可分为整数、分数。',
        formulas: ['$\\mathbb{Q} = \\{ \\frac{p}{q} \\mid p, q \\in \\mathbb{Z}, q \\ne 0 \\}$'],
        examples: ['$-3, 0, \\frac{1}{2}, 0.\\overline{3}$ 都是有理数'],
        tips: ['$\\pi$ 不是有理数', '循环小数都是有理数'],
      },
      {
        id: 'g7-1-rational-2',
        title: '绝对值与相反数',
        summary: '数轴上点到原点的距离叫做绝对值；只有符号不同的两个数互为相反数。',
        formulas: ['$|a| = \\begin{cases} a, & a \\ge 0 \\\\ -a, & a < 0 \\end{cases}$'],
        tips: ['$|a| \\ge 0$ 恒成立', '$|a| = |-a|$'],
      },
    ],
  },
  {
    id: 'g7-2-linear-equation',
    grade: '七年级',
    term: '上',
    title: '一元一次方程',
    points: [
      {
        id: 'g7-2-le-1',
        title: '方程的概念',
        summary: '含有未知数的等式叫做方程；使方程左右两边相等的未知数的值叫做方程的解。',
      },
      {
        id: 'g7-2-le-2',
        title: '解一元一次方程的一般步骤',
        summary: '去分母 → 去括号 → 移项 → 合并同类项 → 系数化为 1。',
        tips: ['移项要变号', '去分母时不要漏乘不含分母的项'],
      },
    ],
  },
  {
    id: 'g7-2-inequality',
    grade: '七年级',
    term: '下',
    title: '不等式与不等式组',
    points: [
      {
        id: 'g7-2-ineq-1',
        title: '不等式的性质',
        summary:
          '不等式两边同时加减同一个数（式）方向不变；同乘除正数方向不变；同乘除负数方向改变。',
        tips: ['乘除负数务必变号', '可在数轴上画解集'],
      },
    ],
  },
  {
    id: 'g8-1-triangle',
    grade: '八年级',
    term: '上',
    title: '三角形与全等三角形',
    points: [
      {
        id: 'g8-1-tri-1',
        title: '三角形的内角和与外角',
        summary: '三角形内角和为 180°；外角等于不相邻两内角之和。',
        formulas: ['$\\angle A + \\angle B + \\angle C = 180^\\circ$'],
      },
      {
        id: 'g8-1-tri-2',
        title: '全等三角形的判定',
        summary: '判定方法：SSS、SAS、ASA、AAS、HL（仅限直角三角形）。',
        tips: ['SSA 不能判定全等', '注意对应顶点顺序'],
      },
    ],
  },
  {
    id: 'g8-2-pythagoras',
    grade: '八年级',
    term: '下',
    title: '勾股定理',
    points: [
      {
        id: 'g8-2-pyth-1',
        title: '勾股定理',
        summary: '直角三角形两直角边的平方和等于斜边的平方。',
        formulas: ['$a^2 + b^2 = c^2$'],
        examples: ['$3, 4, 5$；$5, 12, 13$；$8, 15, 17$'],
      },
      {
        id: 'g8-2-pyth-2',
        title: '勾股定理的逆定理',
        summary: '若一个三角形的三边满足 $a^2 + b^2 = c^2$，则它是直角三角形。',
      },
    ],
  },
  {
    id: 'g8-2-linear-fn',
    grade: '八年级',
    term: '下',
    title: '一次函数',
    points: [
      {
        id: 'g8-2-lf-1',
        title: '一次函数的图象与性质',
        summary:
          '形如 $y = kx + b$ ($k \\ne 0$) 的函数叫一次函数。$k > 0$ 单调递增，$k < 0$ 单调递减。',
        formulas: ['$y = kx + b\\ (k \\ne 0)$'],
        tips: ['$b$ 是 y 轴截距', '$k$ 决定倾斜方向'],
      },
    ],
  },
  {
    id: 'g9-1-quadratic-eq',
    grade: '九年级',
    term: '上',
    title: '一元二次方程',
    points: [
      {
        id: 'g9-1-qe-1',
        title: '求根公式',
        summary:
          '一元二次方程 $ax^2 + bx + c = 0$ ($a \\ne 0$) 的解为 $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$。',
        formulas: [
          '$\\Delta = b^2 - 4ac$',
          '$x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$',
        ],
        tips: [
          '$\\Delta > 0$：两个不相等实根',
          '$\\Delta = 0$：两个相等实根',
          '$\\Delta < 0$：无实数根',
        ],
      },
      {
        id: 'g9-1-qe-2',
        title: '韦达定理',
        summary: '若 $x_1, x_2$ 是 $ax^2 + bx + c = 0$ 的两根，则 $x_1 + x_2 = -\\frac{b}{a}$，$x_1 x_2 = \\frac{c}{a}$。',
      },
    ],
  },
  {
    id: 'g9-1-quadratic-fn',
    grade: '九年级',
    term: '上',
    title: '二次函数',
    points: [
      {
        id: 'g9-1-qf-1',
        title: '二次函数的图象与顶点',
        summary:
          '$y = ax^2 + bx + c$ 是抛物线，顶点坐标 $(-\\frac{b}{2a},\\ \\frac{4ac - b^2}{4a})$，对称轴 $x = -\\frac{b}{2a}$。',
        tips: ['$a > 0$ 开口向上', '$a < 0$ 开口向下'],
      },
    ],
  },
  {
    id: 'g9-2-similar',
    grade: '九年级',
    term: '下',
    title: '相似三角形',
    points: [
      {
        id: 'g9-2-sim-1',
        title: '相似三角形的判定',
        summary: '判定方法：两角对应相等；两边对应成比例且夹角相等；三边对应成比例。',
        tips: ['相似比的平方等于面积比'],
      },
    ],
  },
];

export function getChapterById(id: string): KnowledgeChapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getPointById(id: string):
  | { chapter: KnowledgeChapter; point: KnowledgePoint }
  | undefined {
  for (const chapter of CHAPTERS) {
    const point = chapter.points.find((p) => p.id === id);
    if (point) return { chapter, point };
  }
  return undefined;
}
