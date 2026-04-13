export const continueLearning = {
  title: '合同法 · 违约责任',
  lastStudied: '昨天',
  buttonText: '继续学习',
}

export const recommendedTopics = ['不安抗辩权', '缔约过失责任', '善意取得']

export const exampleQuestions = [
  '什么是不安抗辩权',
  '违约责任构成要件',
  '举一个合同违约案例',
  '抗辩权之间的区别',
  '正当防卫与防卫过当的区别',
  '如何理解表见代理',
  '合同无效和可撤销的差别',
  '共同犯罪的构成条件',
]

export const learningModules = [
  {
    key: 'concept',
    icon: '义',
    title: '概念解释',
    content: [
      '不安抗辩权，是指先履行一方在有确切证据证明对方履约能力明显下降时，可以暂时中止履行。',
    ],
  },
  {
    key: 'elements',
    icon: '要',
    title: '构成要件',
    content: ['1. 存在不安情形', '2. 对方履约能力明显降低', '3. 可在对方提供担保前暂停履行'],
  },
  {
    key: 'case',
    icon: '案',
    title: '案例',
    content: ['甲公司发现乙公司资金链断裂且大额欠薪，于是暂停交货，并通知乙公司先提供担保。'],
  },
  {
    key: 'mistake',
    icon: '误',
    title: '常见误区',
    content: ['并不是一有怀疑就能暂停履行，必须有较充分证据支持不安情形。'],
  },
  {
    key: 'law',
    icon: '条',
    title: '相关法条',
    content: ['可结合《民法典》合同编中关于不安抗辩权的规则理解其适用边界。'],
  },
  {
    key: 'compare',
    icon: '辨',
    title: '易混概念',
    content: ['容易与先履行抗辩权混淆，前者强调履约能力恶化，后者强调履行顺序。'],
  },
]

export const actionLabels = ['再简单一点', '举个案例', '对比易混概念', '生成学习笔记']

export type LearningModule = (typeof learningModules)[number]
