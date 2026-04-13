export interface InsightOverviewItem {
  label: string
  value: string
  description: string
}

export interface LearningTrendPoint {
  stage: string
  window: string
  status: 'learned' | 'upcoming' | 'due' | 'stable'
  note: string
  topics: string[]
}

export interface ConfusionTopicItem {
  title: string
  detail: string
  hint: string
}

export interface ConfusedPairItem {
  left: string
  right: string
  difference: string
}

export interface LearningTimelineItem {
  id: string
  topic: string
  result: string
  time: string
  mood: string
}

export const insightOverview: InsightOverviewItem[] = [
  { label: '今日学习', value: '3', description: '今天已经推进了 3 个知识点的理解。' },
  { label: '本周学习', value: '12', description: '比上周多完成了 2 次结构化学习。' },
  { label: '累计掌握', value: '28', description: '已形成可回看的知识卡片沉淀。' },
  { label: '待复习', value: '6', description: '建议优先回看近期反复卡住的主题。' },
]

export const learningTrend: LearningTrendPoint[] = [
  { stage: '首次学习', window: '当下', status: 'learned', note: '建立知识点印象，先形成基本理解。', topics: ['缔约过失责任'] },
  { stage: '第一次复习', window: '1 天内', status: 'due', note: '最容易遗忘，优先回看核心结论和例子。', topics: ['善意取得', '代位权'] },
  { stage: '第二次复习', window: '2-3 天', status: 'upcoming', note: '开始把定义、法条和边界连起来。', topics: ['不安抗辩权'] },
  { stage: '第三次复习', window: '7 天', status: 'upcoming', note: '通过对比题和案例把判断路径固定下来。', topics: ['先履行抗辩权 vs 不安抗辩权'] },
  { stage: '巩固阶段', window: '14 天+', status: 'stable', note: '转入低频复习，遇到同类问题能快速想起。', topics: ['债权保全主线'] },
]

export const confusionTopics: ConfusionTopicItem[] = [
  {
    title: '不安抗辩权',
    detail: '已经能说出定义，但适用前提和通知义务还容易混在一起。',
    hint: '下次复习时重点看“何时可以中止履行”。',
  },
  {
    title: '善意取得',
    detail: '构成条件记得差不多，但“善意时点”和“公示方式”仍会停顿。',
    hint: '适合和无权处分放在同一张卡片里对照记忆。',
  },
  {
    title: '代位权',
    detail: '债权人何时可以行使、范围到哪里，答题时偶尔还会卡一下。',
    hint: '建议再练 1 个债务人怠于行权的案例。',
  },
]

export const confusedPairs: ConfusedPairItem[] = [
  {
    left: '先履行抗辩权',
    right: '不安抗辩权',
    difference: '一个围绕履行顺序，一个围绕对方履约能力明显恶化，触发条件完全不同。',
  },
  {
    left: '缔约过失责任',
    right: '违约责任',
    difference: '前者发生在合同成立前后信赖受损阶段，后者以有效合同义务被违反为前提。',
  },
]

export const learningTimeline: LearningTimelineItem[] = [
  {
    id: 'timeline-1',
    topic: '不安抗辩权',
    result: '完成了一轮概念梳理，并能用自己的话说出适用场景。',
    time: '今天 20:10',
    mood: '理解更顺了',
  },
  {
    id: 'timeline-2',
    topic: '先履行抗辩权 vs 不安抗辩权',
    result: '做了概念对比，已经能抓住“履行顺序”和“履约风险”两个区分点。',
    time: '今天 18:40',
    mood: '差异开始清楚',
  },
  {
    id: 'timeline-3',
    topic: '善意取得',
    result: '复习到构成条件时有一点卡顿，已标记为待回看主题。',
    time: '昨天 21:05',
    mood: '还需要再巩固',
  },
  {
    id: 'timeline-4',
    topic: '缔约过失责任',
    result: '补了一个案例后，能更稳地说明与违约责任的边界。',
    time: '昨天 19:20',
    mood: '开始建立联系',
  },
  {
    id: 'timeline-5',
    topic: '代位权',
    result: '完成一次短时复习，已经记住“债权保全”这个主线，但行使范围还要再练。',
    time: '周一 20:35',
    mood: '记住主线了',
  },
]
