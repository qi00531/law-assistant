export interface InsightPanelContent {
  key: string
  title: string
  description: string
  highlights: string[]
  suggestion: string
}

export const insightPanels: InsightPanelContent[] = [
  {
    key: '今日学习',
    title: '今天的学习状态',
    description: '今天的理解重心已经从单纯记忆，进入到能够复述和拆解知识点的阶段。',
    highlights: ['已推进多个知识点', '更适合继续追问相关问题', '今天学过的内容最适合立刻复习'],
    suggestion: '先把今天重复出现的问题收一遍，再进入新的概念。',
  },
  {
    key: '本周学习',
    title: '本周学习概览',
    description: '这一周的节奏已经逐渐稳定，说明学习开始形成自己的结构，而不只是临时提问。',
    highlights: ['结构化学习次数高于上周', '开始形成连续主题学习', '适合做一次周内知识串联'],
    suggestion: '优先整理这一周反复出现的主题，形成自己的周复习清单。',
  },
  {
    key: '累计掌握',
    title: '累计掌握情况',
    description: '你已经不只是知道概念，而是在逐步积累可回看、可复习、可再次提问的知识资产。',
    highlights: ['知识点已经开始沉淀成卡片', '重点问题可以直接回看', '适合把零散学习变成稳定体系'],
    suggestion: '优先把已经保存的卡片做一轮复习，而不是继续只看新内容。',
  },
  {
    key: '待复习',
    title: '当前待复习重点',
    description: '这些内容不是完全不会，而是已经接近理解边界，最适合通过复习模式再收紧一次。',
    highlights: ['反复出现但尚未完全稳定', '区分型知识点最值得优先复习', '近期学习过的内容留存效果最好'],
    suggestion: '从最近两次出现过的易混知识点开始复习，会更容易形成判断力。',
  },
]
