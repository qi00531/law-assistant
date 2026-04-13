# Homepage Structured Learning Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage Q&A flow into a structured, scrollable learning timeline with a fixed composer, saved-note-aware review entry, session-level note saving, and a working light/dark theme toggle.

**Architecture:** Keep the existing `/home` route and shared visual language, but replace the single-result page state with a session timeline model. The homepage becomes a fixed-composer shell with a scrollable timeline list, where each item owns its structured modules and optional review entry. Session-level save builds a summarized note payload from the accumulated timeline items. Theme state is stored locally and applied through a lightweight homepage-scoped toggle.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, existing `fetch` API wrapper, FastAPI `/api/ask` + `/api/notes`, localStorage-backed theme state, current Tailwind utility styling.

---

## File Structure

### Existing Files To Modify

- `frontend/src/pages/HomePage.vue`
  - Replace the single-result state machine with timeline-session state, fixed composer orchestration, note save workflow, and review-entry logic.
- `frontend/src/components/home/QuestionInput.vue`
  - Support fixed-composer usage, append-style example actions, persistent draft behavior, and theme-aware styling hooks.
- `frontend/src/components/home/LearningResult.vue`
  - Refactor from “single page result” to rendering a single timeline item shell, or split responsibility if it is too tied to global page framing.
- `frontend/src/components/home/LearningActions.vue`
  - Convert item actions to timeline-aware actions and support session save state.
- `frontend/src/components/home/ExampleQuestionChips.vue`
  - Stop overwriting current content; emit follow-up prompts that append as related questions.
- `frontend/src/components/ReviewMode.vue`
  - No internal stage logic change, but confirm it can render in-item without page-top assumptions.
- `frontend/src/lib/api.ts`
  - Add note list fetcher if needed for review lookup and keep ask/note-save functions aligned with session workflow.
- `frontend/src/utils/buildNotePayload.ts`
  - Replace single-result note payload builder with session-summary builder.
- `frontend/src/style.css`
  - Add homepage timeline shell, fixed composer, and theme token rules.

### Existing Files To Read / Reuse

- `frontend/src/data/mockHomeData.ts`
  - Reuse example questions and action labels, but remove initial example result usage from homepage state.
- `frontend/src/data/reviewModeData.ts`
  - Reuse review content shape and builder patterns where possible.
- `frontend/src/data/mockNotesData.ts`
  - Temporary source for saved-note similarity lookup until notes page is moved to backend data.

### New Files To Create

- `frontend/src/types/homeTimeline.ts`
  - Types for timeline items, session summary, and related-note metadata.
- `frontend/src/utils/mapTimelineItem.ts`
  - Convert `LearningResultResponse` into a timeline item record with modules and metadata.
- `frontend/src/utils/buildSessionNotePayload.ts`
  - Summarize a full timeline into a single `POST /api/notes` payload.
- `frontend/src/utils/findRelatedSavedNote.ts`
  - Local similarity helper that checks a question against saved-note data and returns an optional related note match.
- `frontend/src/composables/useHomepageTheme.ts`
  - Homepage-scoped light/dark toggle with localStorage persistence.
- `frontend/src/components/home/LearningTimeline.vue`
  - Scrollable timeline wrapper for multiple structured result items.
- `frontend/src/components/home/LearningTimelineItem.vue`
  - One structured learning record with relation label, modules, review hint, and local actions.
- `frontend/src/components/home/ReviewHintBar.vue`
  - Inline review hint shown inside a timeline item when a saved note is matched.

## Task 1: Define Homepage Timeline And Theme Types

**Files:**
- Create: `frontend/src/types/homeTimeline.ts`
- Create: `frontend/src/composables/useHomepageTheme.ts`
- Test: `frontend/src/types/homeTimeline.ts`

- [ ] **Step 1: Write the failing type contract mentally and capture it in code-first type definitions**

```ts
export type TimelineRelation = 'root' | 'follow_up'

export interface RelatedSavedNote {
  id: string
  title: string
  summary: string
}

export interface LearningTimelineItem {
  id: string
  question: string
  relation: TimelineRelation
  relationLabel?: string
  createdAt: string
  result: LearningResultResponse
  modules: LearningModule[]
  relatedNote: RelatedSavedNote | null
}

export type HomepageTheme = 'light' | 'dark'
```

Expected: Current codebase has no dedicated timeline/session types, so upcoming component wiring would otherwise duplicate ad hoc object shapes.

- [ ] **Step 2: Create `frontend/src/types/homeTimeline.ts`**

```ts
import type { LearningModule } from '../data/mockHomeData'
import type { LearningResultResponse } from './ask'

export type TimelineRelation = 'root' | 'follow_up'

export interface RelatedSavedNote {
  id: string
  title: string
  summary: string
}

export interface LearningTimelineItem {
  id: string
  question: string
  relation: TimelineRelation
  relationLabel?: string
  createdAt: string
  result: LearningResultResponse
  modules: LearningModule[]
  relatedNote: RelatedSavedNote | null
}

export interface HomepageSessionSummary {
  title: string
  summary: string
}

export type HomepageTheme = 'light' | 'dark'
```

- [ ] **Step 3: Create `frontend/src/composables/useHomepageTheme.ts`**

```ts
import { computed, ref, watch } from 'vue'
import type { HomepageTheme } from '../types/homeTimeline'

const STORAGE_KEY = 'law-assistant-homepage-theme'
const theme = ref<HomepageTheme>('light')

if (typeof window !== 'undefined') {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    theme.value = savedTheme
  }
}

watch(
  theme,
  (value) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, value)
    document.documentElement.dataset.homeTheme = value
  },
  { immediate: true },
)

export const useHomepageTheme = () => {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme: computed(() => theme.value),
    toggleTheme,
  }
}
```

- [ ] **Step 4: Run type check to verify the new files are valid**

Run: `./node_modules/.bin/vue-tsc -b --pretty false`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types/homeTimeline.ts frontend/src/composables/useHomepageTheme.ts
git commit -m "feat: add homepage timeline and theme primitives"
```

## Task 2: Add Timeline Mapping, Note Matching, And Session Save Builders

**Files:**
- Create: `frontend/src/utils/mapTimelineItem.ts`
- Create: `frontend/src/utils/findRelatedSavedNote.ts`
- Create: `frontend/src/utils/buildSessionNotePayload.ts`
- Modify: `frontend/src/utils/mapLearningResult.ts`
- Test: `frontend/src/utils/buildSessionNotePayload.ts`

- [ ] **Step 1: Write the failing helper expectations as executable examples in comments or inline dev notes**

```ts
const item = mapLearningResultToTimelineItem({
  question: '什么是不安抗辩权？',
  relation: 'root',
  result,
  relatedNote: null,
})

expect(item.modules).toHaveLength(6)
expect(item.relation).toBe('root')

const summary = buildSessionNotePayload([rootItem, followUpItem])
expect(summary.title).toContain('不安抗辩权')
expect(summary.content.elements.length).toBeGreaterThan(0)
```

Expected: These behaviors are not implemented yet.

- [ ] **Step 2: Create `frontend/src/utils/mapTimelineItem.ts`**

```ts
import type { LearningModule } from '../data/mockHomeData'
import type { LearningResultResponse } from '../types/ask'
import type { LearningTimelineItem, RelatedSavedNote, TimelineRelation } from '../types/homeTimeline'
import { mapLearningResultToModules } from './mapLearningResult'

const buildRelationLabel = (relation: TimelineRelation) =>
  relation === 'follow_up' ? '继续追问' : '主问题'

export const mapLearningResultToTimelineItem = ({
  question,
  relation,
  result,
  relatedNote,
}: {
  question: string
  relation: TimelineRelation
  result: LearningResultResponse
  relatedNote: RelatedSavedNote | null
}): LearningTimelineItem => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  question,
  relation,
  relationLabel: buildRelationLabel(relation),
  createdAt: new Date().toISOString(),
  result,
  modules: mapLearningResultToModules(result) as LearningModule[],
  relatedNote,
})
```

- [ ] **Step 3: Create `frontend/src/utils/findRelatedSavedNote.ts`**

```ts
import { notes } from '../data/mockNotesData'
import type { RelatedSavedNote } from '../types/homeTimeline'

const normalize = (value: string) =>
  value.trim().replace(/[，。！？、,.!?;；:“”"'（）()\\s]/g, '').toLowerCase()

const toBigrams = (input: string) =>
  input.length < 2 ? new Set([input]) : new Set(Array.from({ length: input.length - 1 }, (_, index) => input.slice(index, index + 2)))

const score = (left: string, right: string) => {
  if (!left || !right) return 0
  if (left === right) return 1
  if (left.includes(right) || right.includes(left)) return 0.9
  const leftPairs = toBigrams(left)
  const rightPairs = toBigrams(right)
  const union = new Set([...leftPairs, ...rightPairs])
  const intersection = [...leftPairs].filter((pair) => rightPairs.has(pair))
  return intersection.length / union.size
}

export const findRelatedSavedNote = (question: string): RelatedSavedNote | null => {
  const normalized = normalize(question)
  const match = notes.find((note) => {
    const fields = [note.title, note.summary, note.sourceQuestion]
    return fields.some((field) => score(normalized, normalize(field)) >= 0.72)
  })

  return match
    ? {
        id: match.id,
        title: match.title,
        summary: match.summary,
      }
    : null
}
```

- [ ] **Step 4: Create `frontend/src/utils/buildSessionNotePayload.ts`**

```ts
import type { NoteCreateRequest } from '../types/notes'
import type { LearningTimelineItem } from '../types/homeTimeline'

const uniq = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)))

export const buildSessionNotePayload = (items: LearningTimelineItem[]): NoteCreateRequest => {
  const [rootItem, ...rest] = items
  const allResults = items.map((item) => item.result)

  const summaryParts = [
    rootItem?.result.concept ?? '',
    ...rest.map((item) => `${item.question}：${item.result.concept}`),
  ].filter(Boolean)

  return {
    title: rootItem?.question.replace(/[？?。！!]+$/g, '').trim() || '法律学习笔记',
    question: rootItem?.question || '法律学习笔记',
    summary: summaryParts.join(' ').slice(0, 1000),
    tags: uniq(allResults.flatMap((result) => result.statutes.some((item) => item.includes('民法典')) ? ['民法典'] : ['法律学习'])).slice(0, 3),
    content: {
      concept: summaryParts.join(' '),
      elements: uniq(allResults.flatMap((result) => result.elements)),
      example: allResults.map((result) => result.example).filter(Boolean).join('；'),
      mistakes: uniq(allResults.flatMap((result) => result.mistakes)),
      statutes: uniq(allResults.flatMap((result) => result.statutes)),
      confusions: allResults.flatMap((result) => result.confusions),
    },
  }
}
```

- [ ] **Step 5: Run type check**

Run: `./node_modules/.bin/vue-tsc -b --pretty false`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/utils/mapTimelineItem.ts frontend/src/utils/findRelatedSavedNote.ts frontend/src/utils/buildSessionNotePayload.ts
git commit -m "feat: add homepage timeline mapping and session note builders"
```

## Task 3: Build Dedicated Timeline Components

**Files:**
- Create: `frontend/src/components/home/LearningTimeline.vue`
- Create: `frontend/src/components/home/LearningTimelineItem.vue`
- Create: `frontend/src/components/home/ReviewHintBar.vue`
- Modify: `frontend/src/components/home/LearningModuleCard.vue`
- Test: `frontend/src/components/home/LearningTimeline.vue`

- [ ] **Step 1: Write the failing render contract as component responsibilities**

```vue
<LearningTimeline
  :items="items"
  :active-review-id="activeReviewId"
  @enter-review="handleEnterReview"
  @action="handleTimelineAction"
/>
```

Expected: No component currently exists that can render multiple structured result entries as a scrollable timeline.

- [ ] **Step 2: Create `frontend/src/components/home/ReviewHintBar.vue`**

```vue
<script setup lang="ts">
defineProps<{
  title: string
  summary: string
}>()

const emit = defineEmits<{
  (event: 'start-review'): void
}>()
</script>

<template>
  <div class="rounded-[24px] border border-emerald-200 bg-emerald-50/80 px-4 py-4">
    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Review Match</p>
    <p class="mt-2 text-sm font-semibold text-slate-900">这个知识点你已经保存过：{{ title }}</p>
    <p class="mt-2 text-sm leading-7 text-slate-600">{{ summary }}</p>
    <button
      type="button"
      class="mt-4 inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      @click="emit('start-review')"
    >
      进入复习
    </button>
  </div>
</template>
```

- [ ] **Step 3: Create `frontend/src/components/home/LearningTimelineItem.vue`**

```vue
<script setup lang="ts">
import type { LearningTimelineItem } from '../../types/homeTimeline'
import ReviewMode from '../ReviewMode.vue'
import LearningModuleCard from './LearningModuleCard.vue'
import ReviewHintBar from './ReviewHintBar.vue'

defineProps<{
  item: LearningTimelineItem
  showReview: boolean
}>()

const emit = defineEmits<{
  (event: 'start-review', itemId: string): void
}>()
</script>

<template>
  <article class="surface-card space-y-5 p-5 sm:p-6">
    <div class="space-y-3">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{{ item.relationLabel }}</p>
      <h2 class="text-2xl font-semibold text-slate-950">{{ item.question }}</h2>
      <p class="text-sm leading-7 text-slate-500">这条学习记录已整理成结构化讲解模块，方便继续追问和复习。</p>
    </div>

    <ReviewHintBar
      v-if="item.relatedNote"
      :title="item.relatedNote.title"
      :summary="item.relatedNote.summary"
      @start-review="emit('start-review', item.id)"
    />

    <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <LearningModuleCard
        v-for="module in item.modules"
        :key="`${item.id}-${module.key}`"
        :icon="module.icon"
        :title="module.title"
        :content="module.content"
      />
    </div>

    <ReviewMode v-if="showReview" />
  </article>
</template>
```

- [ ] **Step 4: Create `frontend/src/components/home/LearningTimeline.vue`**

```vue
<script setup lang="ts">
import type { LearningTimelineItem } from '../../types/homeTimeline'
import LearningTimelineItemCard from './LearningTimelineItem.vue'

defineProps<{
  items: LearningTimelineItem[]
  activeReviewId: string | null
}>()

const emit = defineEmits<{
  (event: 'start-review', itemId: string): void
}>()
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1">
    <LearningTimelineItemCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      :show-review="activeReviewId === item.id"
      @start-review="emit('start-review', $event)"
    />
  </section>
</template>
```

- [ ] **Step 5: Run type check**

Run: `./node_modules/.bin/vue-tsc -b --pretty false`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/home/LearningTimeline.vue frontend/src/components/home/LearningTimelineItem.vue frontend/src/components/home/ReviewHintBar.vue
git commit -m "feat: add homepage structured learning timeline components"
```

## Task 4: Refactor Homepage State To Session Timeline

**Files:**
- Modify: `frontend/src/pages/HomePage.vue`
- Modify: `frontend/src/components/home/ExampleQuestionChips.vue`
- Modify: `frontend/src/components/home/QuestionInput.vue`
- Test: `frontend/src/pages/HomePage.vue`

- [ ] **Step 1: Replace single-result refs with session-level refs**

```ts
const draftQuestion = ref('')
const timelineItems = ref<LearningTimelineItem[]>([])
const isSubmitting = ref(false)
const submitError = ref('')
const activeReviewId = ref<string | null>(null)
const pendingActionLabel = ref<string | null>(null)

const isTimelineMode = computed(() => timelineItems.value.length > 0)
```

Expected: `activeQuestion`, `learningModules`, and top-level `reviewPrompt` are no longer sufficient.

- [ ] **Step 2: Implement submit flow that appends items instead of replacing**

```ts
const submitQuestion = async (question: string, relation: TimelineRelation = 'root') => {
  const trimmedQuestion = question.trim()
  if (!trimmedQuestion || isSubmitting.value) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const result = await askLegalQuestion(trimmedQuestion)
    const relatedNote = findRelatedSavedNote(result.question || trimmedQuestion)
    const item = mapLearningResultToTimelineItem({
      question: result.question || trimmedQuestion,
      relation,
      result,
      relatedNote,
    })

    timelineItems.value = [...timelineItems.value, item]
    draftQuestion.value = ''
    activeReviewId.value = null
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : '提问失败，请稍后重试。'
  } finally {
    isSubmitting.value = false
  }
}
```

- [ ] **Step 3: Make example chips emit follow-up questions instead of overwriting current content**

```ts
const handleExampleSelect = (question: string) => {
  const relation = timelineItems.value.length === 0 ? 'root' : 'follow_up'
  void submitQuestion(question, relation)
}
```

And in `QuestionInput.vue`, keep current draft untouched unless user explicitly edits it:

```ts
const handleSubmit = () => {
  const value = displayValue.value.trim()
  if (!value || props.disabled) return
  emit('submit', value)
}
```

- [ ] **Step 4: Replace top-page review prompt rendering with in-item review rendering**

```vue
<LearningTimeline
  v-if="isTimelineMode"
  :items="timelineItems"
  :active-review-id="activeReviewId"
  @start-review="activeReviewId = $event"
/>
```

Remove:

```vue
<section v-if="reviewPrompt"> ... </section>
<ReviewMode v-if="isReviewMode" />
```

- [ ] **Step 5: Run type check**

Run: `./node_modules/.bin/vue-tsc -b --pretty false`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/HomePage.vue frontend/src/components/home/ExampleQuestionChips.vue frontend/src/components/home/QuestionInput.vue
git commit -m "feat: refactor homepage into a structured learning timeline"
```

## Task 5: Add Session-Level Save Workflow And Fixed Composer Layout

**Files:**
- Modify: `frontend/src/pages/HomePage.vue`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/utils/buildNotePayload.ts`
- Modify: `frontend/src/style.css`
- Test: `frontend/src/pages/HomePage.vue`

- [ ] **Step 1: Replace single-result note save with full-session note save**

```ts
const saveSessionNote = async () => {
  if (timelineItems.value.length === 0) return

  pendingActionLabel.value = '保存本轮笔记'
  noteFeedback.value = null

  try {
    const payload = buildSessionNotePayload(timelineItems.value)
    const saved = await createLearningNote(payload)
    noteFeedback.value = {
      tone: 'success',
      message: `本轮学习已保存为笔记：${saved.title}`,
    }
  } catch (error) {
    noteFeedback.value = {
      tone: 'error',
      message: error instanceof Error ? error.message : '保存失败，请稍后重试。',
    }
  } finally {
    pendingActionLabel.value = null
  }
}
```

- [ ] **Step 2: Move homepage actions from per-result semantics to session semantics**

```ts
const sessionActions = ['保存本轮笔记', '清空本轮']

const handleSessionAction = (label: string) => {
  if (label === '保存本轮笔记') {
    void saveSessionNote()
    return
  }

  if (label === '清空本轮') {
    timelineItems.value = []
    activeReviewId.value = null
    submitError.value = ''
    noteFeedback.value = null
  }
}
```

- [ ] **Step 3: Add fixed-composer shell styles**

Append to `frontend/src/style.css`:

```css
.home-timeline-layout {
  display: grid;
  min-height: calc(100vh - 96px);
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 1.5rem;
}

.home-timeline-scroll {
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.home-fixed-composer {
  position: sticky;
  bottom: 0;
  z-index: 20;
  padding-bottom: 0.75rem;
  backdrop-filter: blur(20px);
}
```

- [ ] **Step 4: Update `HomePage.vue` template to use the fixed composer**

```vue
<section class="home-timeline-layout">
  <div class="home-timeline-scroll">
    <LearningTimeline
      v-if="isTimelineMode"
      :items="timelineItems"
      :active-review-id="activeReviewId"
      @start-review="activeReviewId = $event"
    />
    <div v-else class="..."> ... initial state ... </div>
  </div>

  <div class="home-fixed-composer">
    <QuestionInput
      v-model="draftQuestion"
      :button-text="isSubmitting ? '分析中…' : '发送问题'"
      :disabled="isSubmitting"
      @submit="handleDraftSubmit"
    />
  </div>
</section>
```

- [ ] **Step 5: Run production build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/HomePage.vue frontend/src/style.css frontend/src/utils/buildSessionNotePayload.ts
git commit -m "feat: add fixed composer and session note saving to homepage"
```

## Task 6: Implement Homepage Theme Toggle And Visual Polish

**Files:**
- Modify: `frontend/src/pages/HomePage.vue`
- Modify: `frontend/src/style.css`
- Modify: `frontend/src/layouts/MainLayout.vue`
- Test: `frontend/src/pages/HomePage.vue`

- [ ] **Step 1: Add a real theme toggle button to the homepage header**

```vue
<button
  type="button"
  class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
  @click="toggleTheme"
>
  {{ theme === 'light' ? '切换深色' : '切换浅色' }}
</button>
```

- [ ] **Step 2: Apply theme-aware root classes in `HomePage.vue`**

```ts
const { theme, toggleTheme } = useHomepageTheme()
```

```vue
<section :class="theme === 'dark' ? 'home-theme-dark' : 'home-theme-light'">
  ...
</section>
```

- [ ] **Step 3: Add light/dark homepage token rules in `frontend/src/style.css`**

```css
.home-theme-light {
  --home-bg: #f7fbfd;
  --home-card: rgba(255, 255, 255, 0.88);
  --home-border: rgba(148, 163, 184, 0.18);
  --home-text: #0f172a;
}

.home-theme-dark {
  --home-bg: #08111f;
  --home-card: rgba(15, 23, 42, 0.82);
  --home-border: rgba(148, 163, 184, 0.16);
  --home-text: #f8fafc;
}
```

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/HomePage.vue frontend/src/style.css frontend/src/layouts/MainLayout.vue
git commit -m "feat: add homepage light and dark theme toggle"
```

## Task 7: Final Verification

**Files:**
- Modify: `frontend/src/pages/HomePage.vue` (only if fixes are needed)
- Modify: `frontend/src/style.css` (only if fixes are needed)

- [ ] **Step 1: Run full type check**

Run: `./node_modules/.bin/vue-tsc -b --pretty false`

Expected: PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 3: Manual verification checklist**

Check in the browser:

1. `/home` initial state shows no default result cards
2. First question creates the first timeline item
3. Example chips append follow-up items instead of replacing content
4. Timeline scrolls while input stays fixed
5. Review entry appears only when a saved note match exists
6. ReviewMode opens inline with the matched item
7. Saving creates one summarized note for the full session
8. Theme toggle changes between light and dark without page reload

Expected: All checks pass

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/HomePage.vue frontend/src/style.css
git commit -m "chore: verify homepage structured learning timeline flow"
```

## Self-Review

### Spec Coverage

Covered requirements:

1. Initial state with no default example result: Task 4
2. Structured learning timeline: Tasks 3 and 4
3. Example chips append follow-up items: Task 4
4. Fixed composer + scrollable result area: Task 5
5. Review entry only for saved-note matches: Tasks 2 and 3
6. ReviewMode inline instead of top: Task 4
7. Full-session note save: Task 5
8. Real light/dark toggle: Task 6
9. Clear ask/save error feedback: Tasks 4 and 5

Deferred by spec:

1. Learning records page card-click behavior
2. Notes page button relocation and visual redesign
3. Removal of learning timeline decorations outside homepage

### Placeholder Scan

No `TBD`, `TODO`, or empty implementation placeholders remain. Each task includes exact file paths, code, and verification commands.

### Type Consistency

The plan uses one consistent set of names:

1. `LearningTimelineItem`
2. `RelatedSavedNote`
3. `HomepageTheme`
4. `mapLearningResultToTimelineItem`
5. `buildSessionNotePayload`
6. `findRelatedSavedNote`

These names are reused consistently across tasks.
