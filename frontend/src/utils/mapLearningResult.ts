import type { LearningResultResponse } from '../types/ask'
import type { LearningModule } from '../types/learning'

const toParagraphs = (items: string[], emptyFallback: string) => {
  const cleaned = items.map((item) => item.trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned : [emptyFallback]
}

const formatStatute = (title: string, article: string, content: string) =>
  [[title, article].filter(Boolean).join(' '), content].filter(Boolean).join('：')

export const mapLearningResultToModules = (result: LearningResultResponse): LearningModule[] => [
  {
    key: 'concept',
    icon: '义',
    title: '概念解释',
    content: toParagraphs([result.concept], '暂未生成概念解释。'),
  },
  {
    key: 'elements',
    icon: '要',
    title: '构成要件',
    content: toParagraphs(result.elements, '暂未生成构成要件。'),
  },
  {
    key: 'case',
    icon: '案',
    title: '案例',
    content: toParagraphs([result.example], '暂未生成案例说明。'),
  },
  {
    key: 'mistake',
    icon: '误',
    title: '常见误区',
    content: toParagraphs(result.mistakes, '暂未生成常见误区。'),
  },
  {
    key: 'law',
    icon: '条',
    title: '相关法条',
    content: toParagraphs(
      result.statutes.map((item) => formatStatute(item.title, item.article, item.content)),
      '暂未生成相关法条。',
    ),
  },
  {
    key: 'compare',
    icon: '辨',
    title: '易混概念',
    content: toParagraphs(
      result.confusions.map((item) => `${item.term}：${item.difference}`),
      '暂未生成易混概念对比。',
    ),
  },
]
