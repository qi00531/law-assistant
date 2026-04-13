# Insights And Notes Panel Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the insights page into overview cards + switchable detail panel + plain record list, and move the notes review CTA into the upper area of each note card as a dark primary action.

**Architecture:** Keep existing routes and mock data, but replace the insights page's timeline-centric section with a state-driven panel architecture. Top overview cards become interactive selectors that drive a dedicated middle panel. The lower records section stays list-based and retains review entry behavior. Notes keep the same master-detail layout while only restructuring the note card header/action zone.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, existing mock data modules, current Tailwind utility styling, existing `ReviewMode` integration.

---

## File Structure

### Existing Files To Modify

- `frontend/src/pages/InsightsPage.vue`
  - Add active overview state and wire the new detail panel + simplified records list.
- `frontend/src/components/insights/InsightOverviewCards.vue`
  - Make cards clickable and render active visual state.
- `frontend/src/components/insights/LearningTimeline.vue`
  - Remove timeline visuals and turn it into a plain learning records list.
- `frontend/src/components/notes/NoteCard.vue`
  - Move the review button to the upper internal area and style it as a dark primary action.
- `frontend/src/style.css`
  - Add or refine supporting panel/list styles only if existing utility classes are insufficient.

### Existing Files To Read / Reuse

- `frontend/src/data/mockInsightsData.ts`
  - Reuse overview, trend, confusion, and learning record mock data.
- `frontend/src/data/reviewModeData.ts`
  - Reuse timeline-to-review content mapping for the “重新复习” action.
- `frontend/src/pages/NotesPage.vue`
  - Keep current review expansion behavior unchanged.

### New Files To Create

- `frontend/src/data/mockInsightPanels.ts`
  - Stable panel content keyed to the four overview cards.
- `frontend/src/components/insights/InsightDetailPanel.vue`
  - Middle switchable detail panel controlled by active overview card.

## Task 1: Add Insight Panel Data

**Files:**
- Create: `frontend/src/data/mockInsightPanels.ts`
- Test: `frontend/src/data/mockInsightPanels.ts`

- [ ] **Step 1: Define the panel data contract**

```ts
export interface InsightPanelContent {
  key: string
  title: string
  description: string
  highlights: string[]
  suggestion: string
}
```

Expected: No dedicated middle-panel data structure exists yet.

- [ ] **Step 2: Create `frontend/src/data/mockInsightPanels.ts`**

```ts
export interface InsightPanelContent {
  key: string
  title: string
  description: string
  highlights: string[]
  suggestion: string
}

export const insightPanels: InsightPanelContent[] = [
  {
    key: '掌握节奏',
    title: '最近的掌握节奏',
    description: '你最近的学习状态不是“会不会”的二分法，而是从识别概念逐渐进入区分边界的阶段。',
    highlights: ['学习频率正在稳定抬升', '复习型知识点开始增多', '概念区分题比纯定义题更值得继续练'],
    suggestion: '优先回看最近两次重复出现的知识点，再进入相关追问。',
  },
  {
    key: '易错主题',
    title: '当前最容易卡住的主题',
    description: '这部分内容不是不会，而是已经接近理解边界，只差一次更清晰的重组。',
    highlights: ['容易混淆的概念仍反复出现', '同一制度的适用条件还不够稳定', '建议用复习模式替代重复阅读'],
    suggestion: '从“区分点”切入，而不是重新背整段定义。',
  },
  {
    key: '区分能力',
    title: '区分能力的形成情况',
    description: '你开始能够注意到相似知识点之间的边界，这意味着学习已经从记忆转向判断。',
    highlights: ['对比学习比单点记忆更有效', '成对概念最适合进入复习模式', '判断题和案例题会更受益'],
    suggestion: '下一步可优先练“同类制度差异”问题。',
  },
  {
    key: '复习优先级',
    title: '接下来最适合复习的内容',
    description: '不是把所有内容都再看一遍，而是优先收束那些已经碰过多次、但还没完全稳住的知识点。',
    highlights: ['重复出现的问题优先', '已保存成卡片的主题优先', '最近两天学过的内容优先'],
    suggestion: '先复习再继续追问，会比直接扩展新知识点更稳。',
  },
]
```

- [ ] **Step 3: Run type check**

Run: `./node_modules/.bin/vue-tsc -b --pretty false`

Expected: PASS

## Task 2: Build Clickable Overview Cards And Detail Panel

**Files:**
- Create: `frontend/src/components/insights/InsightDetailPanel.vue`
- Modify: `frontend/src/components/insights/InsightOverviewCards.vue`
- Modify: `frontend/src/pages/InsightsPage.vue`
- Test: `frontend/src/components/insights/InsightOverviewCards.vue`

- [ ] **Step 1: Create `frontend/src/components/insights/InsightDetailPanel.vue`**

```vue
<script setup lang="ts">
import type { InsightPanelContent } from '../../data/mockInsightPanels'

defineProps<{
  panel: InsightPanelContent
}>()
</script>

<template>
  <section class="surface-card p-6">
    <div class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand">当前聚焦</p>
      <h2 class="text-2xl font-semibold tracking-tight text-slate-900">{{ panel.title }}</h2>
      <p class="max-w-3xl text-sm leading-7 text-slate-600">{{ panel.description }}</p>
    </div>

    <div class="mt-6 grid gap-3 lg:grid-cols-3">
      <article
        v-for="highlight in panel.highlights"
        :key="highlight"
        class="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4"
      >
        <p class="text-sm leading-7 text-slate-700">{{ highlight }}</p>
      </article>
    </div>

    <div class="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50/70 px-5 py-4">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">学习建议</p>
      <p class="mt-2 text-sm leading-7 text-slate-700">{{ panel.suggestion }}</p>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Make `InsightOverviewCards.vue` clickable**

Replace props and emits:

```ts
defineProps<{
  items: InsightOverviewItem[]
  activeKey: string
}>()

const emit = defineEmits<{
  (event: 'select', key: string): void
}>()
```

Update each card:

```vue
<button
  type="button"
  class="surface-card relative overflow-hidden p-5 text-left transition"
  :class="
    item.label === activeKey
      ? 'border-brand bg-brandSoft/40 shadow-[0_16px_36px_rgba(43,90,156,0.12)]'
      : 'bg-gradient-to-br from-white via-[#fdfbf8] to-[#f8f3eb] hover:-translate-y-0.5 hover:border-slate-300'
  "
  @click="emit('select', item.label)"
>
```

- [ ] **Step 3: Wire panel state in `frontend/src/pages/InsightsPage.vue`**

```ts
import InsightDetailPanel from '../components/insights/InsightDetailPanel.vue'
import { insightPanels } from '../data/mockInsightPanels'

const activeOverviewKey = ref(insightOverview[0]?.label ?? '')

const activePanelContent = computed(
  () => insightPanels.find((item) => item.key === activeOverviewKey.value) ?? insightPanels[0],
)
```

Use in template:

```vue
<InsightOverviewCards
  :items="insightOverview"
  :active-key="activeOverviewKey"
  @select="activeOverviewKey = $event"
/>

<InsightDetailPanel :panel="activePanelContent" />
```

- [ ] **Step 4: Run type check**

Run: `./node_modules/.bin/vue-tsc -b --pretty false`

Expected: PASS

## Task 3: Remove Timeline Presentation And Keep Reviewable Record List

**Files:**
- Modify: `frontend/src/components/insights/LearningTimeline.vue`
- Modify: `frontend/src/pages/InsightsPage.vue`
- Test: `frontend/src/components/insights/LearningTimeline.vue`

- [ ] **Step 1: Replace the timeline layout with a plain list layout**

Remove:

```vue
<div class="hidden md:flex md:flex-col md:items-center">
  ...
</div>
```

Replace the item shell with:

```vue
<article
  v-for="item in items"
  :key="item.id"
  class="rounded-[26px] border border-slate-200 bg-white p-5"
>
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <p class="text-lg font-semibold text-slate-900">{{ item.topic }}</p>
      <p class="mt-1 text-sm text-slate-400">{{ item.time }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <span class="rounded-full bg-brandSoft px-3 py-1 text-xs font-medium text-brand">
        {{ item.mood }}
      </span>
      <button
        type="button"
        class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        @click="emit('review', item.id)"
      >
        重新复习
      </button>
    </div>
  </div>
  <p class="mt-3 text-sm leading-7 text-slate-600">{{ item.result }}</p>
</article>
```

- [ ] **Step 2: Keep review mode below the list in `InsightsPage.vue`**

No behavioral change needed beyond keeping:

```vue
<LearningTimeline :items="learningTimeline" @review="reviewTimelineId = $event" />
<ReviewMode v-if="reviewContent" :content="reviewContent" />
```

Expected: Review behavior remains intact while the page no longer looks like a timeline.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS

## Task 4: Move Notes Review CTA To The Upper Card Area

**Files:**
- Modify: `frontend/src/components/notes/NoteCard.vue`
- Test: `frontend/src/components/notes/NoteCard.vue`

- [ ] **Step 1: Move the review button into the upper metadata area**

Within the card header block, replace the current upper-right count-only area with:

```vue
<div class="flex flex-col items-end gap-3">
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
    @click.stop="emit('review')"
  >
    进入复习
  </button>
  <span
    class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border text-sm font-semibold"
    :class="selected ? 'border-brand/20 bg-white text-brand' : 'border-slate-200 bg-slate-50 text-slate-500'"
  >
    {{ note.keyPoints.length }}
  </span>
</div>
```

- [ ] **Step 2: Remove the old bottom action row**

Delete:

```vue
<div class="mt-4 flex items-center justify-end border-t border-slate-100 pt-4">
  <button ...>进入复习</button>
</div>
```

- [ ] **Step 3: Verify click behavior stays the same**

Run through the page manually:

1. Click note card body → selects note
2. Click `进入复习` → opens ReviewMode in right detail panel

Expected: PASS

## Task 5: Final Verification

**Files:**
- Modify only if follow-up fixes are required

- [ ] **Step 1: Run type check**

Run: `./node_modules/.bin/vue-tsc -b --pretty false`

Expected: PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 3: Manual verification checklist**

Check in the browser:

1. Insights page top four cards are clickable
2. Active card styling changes when clicked
3. Middle detail panel updates with the clicked card's content
4. Learning records no longer show any timeline line, node, or connector
5. Records still allow `重新复习`
6. Notes page review button sits inside the upper card area
7. Notes page review button is dark and visually prominent
8. Clicking notes review button still opens ReviewMode in the right detail panel

Expected: All checks pass

## Self-Review

### Spec Coverage

Covered requirements:

1. Insights timeline visuals removed: Task 3
2. Top four cards become clickable: Task 2
3. Middle detail panel switches content: Task 2
4. Lower record list remains: Tasks 2 and 3
5. Record review behavior remains: Task 3
6. Notes review button moved upward: Task 4
7. Notes review button becomes dark primary: Task 4
8. Review expansion behavior unchanged: Task 4

### Placeholder Scan

No `TBD`, `TODO`, or unresolved placeholders remain.

### Type Consistency

The plan consistently uses:

1. `activeOverviewKey`
2. `activePanelContent`
3. `InsightDetailPanel`
4. `insightPanels`

These names are used consistently across data, page state, and component wiring.
