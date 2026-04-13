export const noteTags = ['合同法', '侵权法', '物权法', '民法典'] as const
export const sortOptions = ['最近学习', '创建时间', '重要程度'] as const

export type NoteTag = string
export type SortOption = (typeof sortOptions)[number]

export interface NoteItem {
  id: string
  title: string
  summary: string
  tags: string[]
  lastLearningTime: string
  lastLearningOrder: number
  createdAt: string
  importance: number
  needsReview?: boolean
  category: string
  sourceQuestion: string
  structuredSummary: string[]
  keyPoints: string[]
  suggestions: string[]
}

export const notes: NoteItem[] = [
  {
    id: 'breach-elements',
    title: '违约责任构成要件',
    summary: '违约责任成立需要违约行为、损害结果以及因果关系。',
    tags: ['合同法'],
    lastLearningTime: '昨天',
    lastLearningOrder: 1,
    createdAt: '2026-04-01',
    importance: 5,
    needsReview: true,
    category: '合同法',
    sourceQuestion: '违约责任构成要件是什么？',
    structuredSummary: ['违约事实是前提。', '损害后果影响责任范围。', '因果关系决定赔偿归责。'],
    keyPoints: ['先确认是否存在有效合同。', '再判断义务是否违反。', '最后分析责任承担方式。'],
    suggestions: ['可继续对比缔约过失责任。', '建议结合典型合同纠纷案例记忆。'],
  },
  {
    id: 'contract-rescission',
    title: '合同解除与违约责任衔接',
    summary: '合同解除并不当然排除违约责任，需结合解除原因与损失范围判断。',
    tags: ['合同法', '民法典'],
    lastLearningTime: '2 天前',
    lastLearningOrder: 2,
    createdAt: '2026-03-26',
    importance: 4,
    category: '合同法',
    sourceQuestion: '合同解除后还能请求违约责任吗？',
    structuredSummary: ['解除权解决继续履行问题。', '损害赔偿请求权可能继续存在。', '需区分法定解除与约定解除。'],
    keyPoints: ['先判断解除是否有效。', '再看损失是否已被返还财产覆盖。', '违约金条款通常仍需单独审查。'],
    suggestions: ['可联动学习定金罚则与解除竞合。', '适合配合买卖合同案例记忆。'],
  },
  {
    id: 'tort-fault',
    title: '一般侵权责任的过错判断',
    summary: '一般侵权以行为、损害、因果关系与过错四要素作为判断主线。',
    tags: ['侵权法'],
    lastLearningTime: '今天',
    lastLearningOrder: 0,
    createdAt: '2026-04-04',
    importance: 5,
    needsReview: true,
    category: '侵权法',
    sourceQuestion: '一般侵权责任中的过错应如何判断？',
    structuredSummary: ['过错通常表现为故意或过失。', '判断标准常结合合理人注意义务。', '特殊情形下会与违法性认定交织。'],
    keyPoints: ['先识别行为人负有何种注意义务。', '再比对行为是否低于该标准。', '结合损害发生的可预见性分析。'],
    suggestions: ['可继续对比无过错责任与公平责任。', '建议复习高空抛物和安全保障义务案例。'],
  },
  {
    id: 'security-obligation',
    title: '安全保障义务责任框架',
    summary: '经营场所管理人未尽到合理安全保障义务时，可能承担补充责任或相应侵权责任。',
    tags: ['侵权法', '民法典'],
    lastLearningTime: '3 天前',
    lastLearningOrder: 3,
    createdAt: '2026-03-30',
    importance: 3,
    category: '侵权法',
    sourceQuestion: '安全保障义务责任应如何分层分析？',
    structuredSummary: ['先看管理人是否负有防护义务。', '再判断第三人侵权与管理人责任如何分配。', '最后处理补充责任的追偿问题。'],
    keyPoints: ['区分直接侵权人与义务违反者。', '把握“合理限度”这一判断核心。', '补充责任并非一律全额赔偿。'],
    suggestions: ['可结合商场、学校、酒店场景分类复习。'],
  },
  {
    id: 'bona-fide-acquisition',
    title: '善意取得成立条件',
    summary: '善意取得围绕无处分权、受让人善意、有偿取得和登记交付等条件展开。',
    tags: ['物权法', '民法典'],
    lastLearningTime: '上周',
    lastLearningOrder: 7,
    createdAt: '2026-03-18',
    importance: 5,
    category: '物权法',
    sourceQuestion: '善意取得需要满足哪些条件？',
    structuredSummary: ['处分人需无权处分。', '受让人取得时应为善意。', '还需满足有偿与公示要件。'],
    keyPoints: ['先辨认标的物是否适用善意取得。', '再审查善意时间点。', '最后看登记或交付是否完成。'],
    suggestions: ['适合与表见代理、无权处分放在一起比较。', '建议专门复习动产与不动产差异。'],
  },
  {
    id: 'usufruct-vs-ownership',
    title: '用益物权与所有权区分',
    summary: '用益物权强调对他人之物的占有、使用、收益权限，不等同于所有权完整支配。',
    tags: ['物权法'],
    lastLearningTime: '5 天前',
    lastLearningOrder: 5,
    createdAt: '2026-03-22',
    importance: 2,
    category: '物权法',
    sourceQuestion: '用益物权和所有权的核心区别是什么？',
    structuredSummary: ['所有权内容最完整。', '用益物权来源于法律或合同设定。', '处分权通常不属于用益物权人。'],
    keyPoints: ['抓住“他人之物”这一定位。', '区分占有使用收益与处分。', '结合土地承包经营权理解更直观。'],
    suggestions: ['可继续串联担保物权，形成物权体系图。'],
  },
  {
    id: 'civil-code-principles',
    title: '民法典基本原则速览',
    summary: '平等、自愿、公平、诚信、守法与绿色原则共同构成民法典的一般价值框架。',
    tags: ['民法典'],
    lastLearningTime: '本周一',
    lastLearningOrder: 4,
    createdAt: '2026-03-15',
    importance: 4,
    category: '民法典',
    sourceQuestion: '民法典的基本原则有哪些，如何理解？',
    structuredSummary: ['基本原则具有统领解释功能。', '答题时要联系制度场景说明。', '诚信原则和公平原则是高频考点。'],
    keyPoints: ['不要只背名称，要能说明适用场景。', '注意绿色原则在传统民法中的新增意义。', '结合总则编理解更稳固。'],
    suggestions: ['可继续复习公序良俗与诚实信用的边界。', '建议整理成考试答题模板。'],
  },
]
