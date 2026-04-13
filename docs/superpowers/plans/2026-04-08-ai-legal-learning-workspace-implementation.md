# AI Legal Learning Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Vue 3 + TailwindCSS frontend for the Fa Xiao Zhi legal learning workspace with a collapsible sidebar, three mock-data pages, and polished page-specific UI behavior.

**Architecture:** Convert the existing single-demo Vite app into a small routed SPA. Use `MainLayout` as the application shell, keep page state local with Composition API, and drive all UI from typed mock data modules so the interface feels like a real product without backend integration.

**Tech Stack:** Vue 3, Composition API, TypeScript, Vue Router, TailwindCSS, Vite

---

## File Map

### Create

- `frontend/postcss.config.js` - PostCSS config for Tailwind
- `frontend/tailwind.config.js` - Tailwind theme extensions for the legal learning workspace
- `frontend/src/router/index.ts` - App routes for home, notes, and insights pages
- `frontend/src/layouts/MainLayout.vue` - Shared shell with sidebar and content slot
- `frontend/src/composables/useSidebar.ts` - Sidebar collapsed state and toggle helper
- `frontend/src/data/mockHomeData.ts` - Home page mock learning data
- `frontend/src/data/mockNotesData.ts` - Notes page mock cards and filters
- `frontend/src/data/mockInsightsData.ts` - Insights page mock metrics and timeline
- `frontend/src/components/Sidebar.vue`
- `frontend/src/components/NavItem.vue`
- `frontend/src/components/home/WelcomeSection.vue`
- `frontend/src/components/home/ContinueLearningCard.vue`
- `frontend/src/components/home/RecommendedTopics.vue`
- `frontend/src/components/home/QuestionInput.vue`
- `frontend/src/components/home/ExampleQuestionChips.vue`
- `frontend/src/components/home/LearningModuleCard.vue`
- `frontend/src/components/home/LearningActions.vue`
- `frontend/src/components/home/LearningResult.vue`
- `frontend/src/components/notes/NotesToolbar.vue`
- `frontend/src/components/notes/NoteCard.vue`
- `frontend/src/components/notes/NotesList.vue`
- `frontend/src/components/notes/NoteDetail.vue`
- `frontend/src/components/insights/InsightOverviewCards.vue`
- `frontend/src/components/insights/LearningTrend.vue`
- `frontend/src/components/insights/ConfusionTopics.vue`
- `frontend/src/components/insights/ConfusedPairs.vue`
- `frontend/src/components/insights/LearningTimeline.vue`
- `frontend/src/pages/HomePage.vue`
- `frontend/src/pages/NotesPage.vue`
- `frontend/src/pages/InsightsPage.vue`

### Modify

- `frontend/package.json` - Add routing and Tailwind dependencies plus optional lint-friendly scripts if needed
- `frontend/src/main.ts` - Register router
- `frontend/src/App.vue` - Replace demo screen with router view
- `frontend/src/style.css` - Replace bespoke demo CSS with Tailwind entry plus global tokens

## Task 1: Set Up SPA and Tailwind Foundation

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/postcss.config.js`
- Create: `frontend/tailwind.config.js`
- Modify: `frontend/src/style.css`
- Modify: `frontend/src/main.ts`
- Modify: `frontend/src/App.vue`
- Create: `frontend/src/router/index.ts`

- [ ] **Step 1: Add the required dependencies**

Update `frontend/package.json` so the app can use router and Tailwind:

```json
{
  "dependencies": {
    "vue": "^3.5.30",
    "vue-router": "^4.5.1"
  },
  "devDependencies": {
    "@types/node": "^24.12.0",
    "@vitejs/plugin-vue": "^6.0.5",
    "@vue/tsconfig": "^0.9.0",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.9.3",
    "vite": "^8.0.1",
    "vue-tsc": "^3.2.5"
  }
}
```

- [ ] **Step 2: Create Tailwind and PostCSS config**

Create `frontend/postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Create `frontend/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F8FA',
        ink: '#1F2937',
        muted: '#6B7280',
        line: '#E5E7EB',
        brand: '#2E5B9A',
        brandSoft: '#EAF1FB',
        warm: '#F4EFE7',
      },
      borderRadius: {
        '2.5xl': '1.5rem',
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.05)',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Replace the global stylesheet with Tailwind entry and shared tokens**

Set `frontend/src/style.css` to:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html,
  body,
  #app {
    min-height: 100%;
  }

  body {
    @apply bg-canvas text-ink antialiased;
    margin: 0;
    background-image:
      radial-gradient(circle at top left, rgba(234, 241, 251, 0.95), transparent 28%),
      linear-gradient(180deg, #f8f9fb 0%, #f7f8fa 100%);
  }

  * {
    box-sizing: border-box;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }
}

@layer components {
  .surface-card {
    @apply rounded-2xl border border-line bg-white shadow-card;
  }

  .page-shell {
    @apply mx-auto flex w-full max-w-[1480px] flex-col gap-8 px-6 py-6 xl:px-8;
  }
}
```

- [ ] **Step 4: Install and verify the new dependencies**

Run: `npm install`
Expected: install succeeds and `package-lock.json` updates with `vue-router`, `tailwindcss`, `postcss`, and `autoprefixer`

- [ ] **Step 5: Replace the demo app with router bootstrapping**

Set `frontend/src/router/index.ts` to:

```ts
import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../pages/HomePage.vue'
import NotesPage from '../pages/NotesPage.vue'
import InsightsPage from '../pages/InsightsPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: HomePage },
    { path: '/notes', component: NotesPage },
    { path: '/insights', component: InsightsPage },
  ],
})
```

Set `frontend/src/main.ts` to:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './style.css'

createApp(App).use(router).mount('#app')
```

Set `frontend/src/App.vue` to:

```vue
<script setup lang="ts">
</script>

<template>
  <RouterView />
</template>
```

- [ ] **Step 6: Verify the foundation builds**

Run: `npm run build`
Expected: Vite build succeeds even if pages are still temporary placeholders

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/postcss.config.js frontend/tailwind.config.js frontend/src/style.css frontend/src/main.ts frontend/src/App.vue frontend/src/router/index.ts
git commit -m "feat: set up routed Tailwind app shell foundation"
```

## Task 2: Build the Shared Layout and Sidebar

**Files:**
- Create: `frontend/src/composables/useSidebar.ts`
- Create: `frontend/src/components/NavItem.vue`
- Create: `frontend/src/components/Sidebar.vue`
- Create: `frontend/src/layouts/MainLayout.vue`
- Create: `frontend/src/pages/HomePage.vue`
- Create: `frontend/src/pages/NotesPage.vue`
- Create: `frontend/src/pages/InsightsPage.vue`

- [ ] **Step 1: Create the sidebar composable**

Create `frontend/src/composables/useSidebar.ts`:

```ts
import { ref } from 'vue'

const isCollapsed = ref(false)

export function useSidebar() {
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
  }

  return {
    isCollapsed,
    toggleSidebar,
  }
}
```

- [ ] **Step 2: Create a reusable navigation item**

Create `frontend/src/components/NavItem.vue` with props for label, icon, active state, collapsed state, and tooltip:

```vue
<script setup lang="ts">
defineProps<{
  label: string
  icon: string
  to?: string
  active?: boolean
  collapsed?: boolean
}>()
</script>

<template>
  <RouterLink
    :to="to || '/'"
    class="group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition"
    :class="active ? 'bg-brandSoft text-brand' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
  >
    <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-base">
      {{ icon }}
    </span>
    <span v-if="!collapsed" class="truncate">{{ label }}</span>
    <span
      v-if="collapsed"
      class="pointer-events-none absolute left-full top-1/2 z-10 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block"
    >
      {{ label }}
    </span>
  </RouterLink>
</template>
```

- [ ] **Step 3: Create the sidebar component**

Create `frontend/src/components/Sidebar.vue` with width states, logo, nav links, theme switch, and user block:

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import NavItem from './NavItem.vue'

defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const route = useRoute()

const navItems = [
  { label: '首页问答', icon: '法', to: '/home' },
  { label: '卡片库', icon: '卡', to: '/notes' },
  { label: '学习记录', icon: '录', to: '/insights' },
]
</script>

<template>
  <aside
    class="sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/70 bg-white/80 px-3 py-4 backdrop-blur"
    :class="collapsed ? 'w-[72px]' : 'w-[240px]'"
  >
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-sm font-semibold text-white">法</div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-900">法小智</p>
          <p class="truncate text-xs text-slate-500">Legal Learning Workspace</p>
        </div>
      </div>
      <button
        class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100"
        type="button"
        @click="emit('toggle')"
      >
        {{ collapsed ? '›' : '‹' }}
      </button>
    </div>

    <nav class="flex flex-1 flex-col gap-2">
      <NavItem
        v-for="item in navItems"
        :key="item.to"
        :active="route.path === item.to"
        :collapsed="collapsed"
        :icon="item.icon"
        :label="item.label"
        :to="item.to"
      />
    </nav>

    <div class="mt-6 space-y-3">
      <button class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-100">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-white">☼</span>
        <span v-if="!collapsed">浅色模式</span>
      </button>

      <div class="flex items-center gap-3 rounded-2xl bg-warm px-3 py-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-white font-semibold text-slate-700">Q</div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="truncate text-sm font-medium text-slate-900">Qisen</p>
          <p class="truncate text-xs text-slate-500">继续今天的学习</p>
        </div>
      </div>
    </div>
  </aside>
</template>
```

- [ ] **Step 4: Create the shared main layout**

Create `frontend/src/layouts/MainLayout.vue`:

```vue
<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue'
import { useSidebar } from '../composables/useSidebar'

const { isCollapsed, toggleSidebar } = useSidebar()

defineProps<{
  pageTitle: string
  pageDescription: string
}>()
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink">
    <div class="mx-auto flex min-h-screen max-w-[1600px]">
      <Sidebar :collapsed="isCollapsed" @toggle="toggleSidebar" />
      <main class="min-w-0 flex-1">
        <div class="page-shell">
          <header class="flex flex-col gap-2">
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{{ pageTitle }}</p>
            <p class="max-w-3xl text-sm text-slate-500">{{ pageDescription }}</p>
          </header>
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Create temporary page placeholders**

Use this shape for each page until their real components are built:

```vue
<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'
</script>

<template>
  <MainLayout page-title="首页问答" page-description="围绕一个法律知识点开始今天的学习。">
    <section class="surface-card p-8">
      <h1 class="text-3xl font-semibold text-slate-900">页面建设中</h1>
      <p class="mt-3 text-sm text-slate-500">下一任务会填入对应的模块化内容。</p>
    </section>
  </MainLayout>
</template>
```

- [ ] **Step 6: Verify shell behavior**

Run: `npm run build`
Expected: build succeeds and the routed app has a visible layout skeleton when served locally

- [ ] **Step 7: Commit**

```bash
git add frontend/src/composables/useSidebar.ts frontend/src/components/NavItem.vue frontend/src/components/Sidebar.vue frontend/src/layouts/MainLayout.vue frontend/src/pages/HomePage.vue frontend/src/pages/NotesPage.vue frontend/src/pages/InsightsPage.vue
git commit -m "feat: add shared workspace layout and sidebar"
```

## Task 3: Implement the Home Learning Page

**Files:**
- Create: `frontend/src/data/mockHomeData.ts`
- Create: `frontend/src/components/home/WelcomeSection.vue`
- Create: `frontend/src/components/home/ContinueLearningCard.vue`
- Create: `frontend/src/components/home/RecommendedTopics.vue`
- Create: `frontend/src/components/home/QuestionInput.vue`
- Create: `frontend/src/components/home/ExampleQuestionChips.vue`
- Create: `frontend/src/components/home/LearningModuleCard.vue`
- Create: `frontend/src/components/home/LearningActions.vue`
- Create: `frontend/src/components/home/LearningResult.vue`
- Modify: `frontend/src/pages/HomePage.vue`

- [ ] **Step 1: Create mock home data**

Create `frontend/src/data/mockHomeData.ts`:

```ts
export const continueLearning = {
  title: '合同法 · 违约责任',
  lastStudied: '昨天',
  buttonText: '继续学习',
}

export const recommendedTopics = [
  '不安抗辩权',
  '缔约过失责任',
  '善意取得',
]

export const exampleQuestions = [
  '什么是不安抗辩权',
  '违约责任构成要件',
  '举一个合同违约案例',
  '抗辩权之间的区别',
]

export const learningModules = [
  { key: 'concept', icon: '义', title: '概念解释', content: ['不安抗辩权，是指先履行一方在有确切证据证明对方履约能力明显下降时，可以暂时中止履行。'] },
  { key: 'elements', icon: '要', title: '构成要件', content: ['1. 存在不安情形', '2. 对方履约能力明显降低', '3. 可在对方提供担保前暂停履行'] },
  { key: 'case', icon: '案', title: '案例', content: ['甲公司发现乙公司资金链断裂且大额欠薪，于是暂停交货，并通知乙公司先提供担保。'] },
  { key: 'mistake', icon: '误', title: '常见误区', content: ['并不是一有怀疑就能暂停履行，必须有较充分证据支持不安情形。'] },
  { key: 'law', icon: '条', title: '相关法条', content: ['可结合《民法典》合同编中关于不安抗辩权的规则理解其适用边界。'] },
  { key: 'compare', icon: '辨', title: '易混概念', content: ['容易与先履行抗辩权混淆，前者强调履约能力恶化，后者强调履行顺序。'] },
]

export const actionLabels = ['再简单一点', '举个案例', '对比易混概念', '生成学习笔记']
```

- [ ] **Step 2: Build the reusable home components**

Each component should stay focused:

- `WelcomeSection.vue`: brand name and compact description
- `ContinueLearningCard.vue`: title, meta, CTA
- `RecommendedTopics.vue`: three topic cards that emit `select`
- `QuestionInput.vue`: textarea with auto-resize up to four rows, `submit` emit
- `ExampleQuestionChips.vue`: four pill actions
- `LearningModuleCard.vue`: icon, title, list/paragraph content
- `LearningActions.vue`: row of learning buttons
- `LearningResult.vue`: compose title card, module grid, action row, and follow-up input

Use this auto-resize logic in `QuestionInput.vue`:

```ts
const resize = () => {
  const element = textareaRef.value
  if (!element) return
  element.style.height = 'auto'
  const lineHeight = 28
  const maxHeight = lineHeight * 4 + 24
  element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`
}
```

- [ ] **Step 3: Assemble the home page state**

`frontend/src/pages/HomePage.vue` should:

- keep `draftQuestion`
- keep `activeQuestion`
- derive `isResultMode`
- switch to result mode when submitting, selecting a topic, selecting a chip, or clicking continue learning
- allow returning to initial mode

Use this page shape:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import ContinueLearningCard from '../components/home/ContinueLearningCard.vue'
import ExampleQuestionChips from '../components/home/ExampleQuestionChips.vue'
import LearningResult from '../components/home/LearningResult.vue'
import QuestionInput from '../components/home/QuestionInput.vue'
import RecommendedTopics from '../components/home/RecommendedTopics.vue'
import WelcomeSection from '../components/home/WelcomeSection.vue'
import { actionLabels, continueLearning, exampleQuestions, learningModules, recommendedTopics } from '../data/mockHomeData'

const draftQuestion = ref('')
const activeQuestion = ref('')
const isResultMode = computed(() => activeQuestion.value.length > 0)

const openQuestion = (question: string) => {
  draftQuestion.value = question
  activeQuestion.value = question
}

const resetPage = () => {
  activeQuestion.value = ''
}
</script>
```

- [ ] **Step 4: Verify the home page behavior**

Run: `npm run build`
Expected: build succeeds and home page supports initial state, result state, chips, recommended topics, and follow-up interactions

- [ ] **Step 5: Commit**

```bash
git add frontend/src/data/mockHomeData.ts frontend/src/components/home frontend/src/pages/HomePage.vue
git commit -m "feat: implement home learning workspace"
```

## Task 4: Implement the Knowledge Cards Page

**Files:**
- Create: `frontend/src/data/mockNotesData.ts`
- Create: `frontend/src/components/notes/NotesToolbar.vue`
- Create: `frontend/src/components/notes/NoteCard.vue`
- Create: `frontend/src/components/notes/NotesList.vue`
- Create: `frontend/src/components/notes/NoteDetail.vue`
- Modify: `frontend/src/pages/NotesPage.vue`

- [ ] **Step 1: Create notes mock data**

Create `frontend/src/data/mockNotesData.ts` with:

```ts
export const noteTags = ['合同法', '侵权法', '物权法', '民法典']
export const sortOptions = ['最近学习', '创建时间', '重要程度']

export const notes = [
  {
    id: 'breach-elements',
    title: '违约责任构成要件',
    summary: '违约责任成立需要违约行为、损害结果以及因果关系。',
    tags: ['合同法'],
    lastLearningTime: '昨天',
    keyPointsCount: 5,
    needsReview: true,
    category: '合同法',
    sourceQuestion: '违约责任构成要件是什么？',
    structuredSummary: ['违约事实是前提。', '损害后果影响责任范围。', '因果关系决定赔偿归责。'],
    keyPoints: ['先确认是否存在有效合同。', '再判断义务是否违反。', '最后分析责任承担方式。'],
    suggestions: ['可继续对比缔约过失责任。', '建议结合典型合同纠纷案例记忆。'],
  }
]
```

- [ ] **Step 2: Build the notes browsing components**

Implement:

- `NotesToolbar.vue` for search, tags, sort, and layout mode
- `NoteCard.vue` for selectable note cards
- `NotesList.vue` for `grid` and `masonry` rendering
- `NoteDetail.vue` for the structured reading panel

Use a masonry-friendly class toggle like:

```vue
<div :class="layoutMode === 'masonry' ? 'columns-1 gap-4 xl:columns-2' : 'grid gap-4'">
```

- [ ] **Step 3: Assemble the notes page state**

`frontend/src/pages/NotesPage.vue` should manage:

- `searchTerm`
- `selectedTag`
- `selectedSort`
- `layoutMode`
- `selectedNoteId`
- `filteredNotes`
- `selectedNote`

Page layout target:

```vue
<template>
  <MainLayout page-title="卡片库" page-description="整理、筛选并回看你已经沉淀下来的法律知识卡片。">
    <section class="grid gap-6 xl:grid-cols-[minmax(360px,460px)_minmax(0,1fr)]">
      <div class="space-y-5">
        <NotesToolbar />
        <NotesList />
      </div>
      <NoteDetail />
    </section>
  </MainLayout>
</template>
```

- [ ] **Step 4: Verify list-detail interactions**

Run: `npm run build`
Expected: build succeeds and note selection, tag filtering, search, sort display, and layout mode switching all work with mock data

- [ ] **Step 5: Commit**

```bash
git add frontend/src/data/mockNotesData.ts frontend/src/components/notes frontend/src/pages/NotesPage.vue
git commit -m "feat: implement knowledge cards workspace"
```

## Task 5: Implement the Learning Insights Page

**Files:**
- Create: `frontend/src/data/mockInsightsData.ts`
- Create: `frontend/src/components/insights/InsightOverviewCards.vue`
- Create: `frontend/src/components/insights/LearningTrend.vue`
- Create: `frontend/src/components/insights/ConfusionTopics.vue`
- Create: `frontend/src/components/insights/ConfusedPairs.vue`
- Create: `frontend/src/components/insights/LearningTimeline.vue`
- Modify: `frontend/src/pages/InsightsPage.vue`

- [ ] **Step 1: Create insights mock data**

Create `frontend/src/data/mockInsightsData.ts` with metrics, seven-day trend points, confusion items, concept pairs, and timeline rows:

```ts
export const insightOverview = [
  { label: '今日学习', value: '3', description: '今天已经推进了 3 个知识点的理解。' },
  { label: '本周学习', value: '12', description: '比上周多完成了 2 次结构化学习。' },
  { label: '累计掌握', value: '28', description: '已形成可回看的知识卡片沉淀。' },
  { label: '待复习', value: '6', description: '建议优先回看近期反复卡住的主题。' },
]
```

- [ ] **Step 2: Build the insights components**

Implement:

- `InsightOverviewCards.vue`
- `LearningTrend.vue` using inline SVG polyline
- `ConfusionTopics.vue`
- `ConfusedPairs.vue`
- `LearningTimeline.vue`

Use a simple SVG line approach:

```ts
const points = trend.map((item, index) => `${index * 56},${120 - item.value * 14}`).join(' ')
```

- [ ] **Step 3: Assemble the insights page**

`frontend/src/pages/InsightsPage.vue` should compose:

- overview cards at top
- a two-column diagnosis section for trend and confusion analysis
- a full-width timeline section below

Use:

```vue
<template>
  <MainLayout page-title="学习记录" page-description="用更柔和的方式回看你的学习节奏、困惑点和最近进展。">
    <div class="space-y-6">
      <InsightOverviewCards />
      <section class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <LearningTrend />
        <div class="space-y-6">
          <ConfusionTopics />
          <ConfusedPairs />
        </div>
      </section>
      <LearningTimeline />
    </div>
  </MainLayout>
</template>
```

- [ ] **Step 4: Verify the insights page**

Run: `npm run build`
Expected: build succeeds and the page reads as a personal learning reflection page instead of an admin dashboard

- [ ] **Step 5: Commit**

```bash
git add frontend/src/data/mockInsightsData.ts frontend/src/components/insights frontend/src/pages/InsightsPage.vue
git commit -m "feat: implement learning insights page"
```

## Task 6: Polish, QA, and Final Verification

**Files:**
- Modify: `frontend/src/components/**/*`
- Modify: `frontend/src/pages/**/*`
- Modify: `frontend/src/style.css`

- [ ] **Step 1: Apply cross-page polish**

Check these items and adjust classes where needed:

- sidebar widths are exactly `240px` and `72px`
- cards use white background, soft border, soft shadow, and roomy padding
- home page has the most breathing room
- notes page feels most orderly and stable
- insights page feels softer and more reflective
- there are no chat bubbles or avatar conversation layouts anywhere

- [ ] **Step 2: Run final verification**

Run: `npm run build`
Expected: PASS with production bundle output

- [ ] **Step 3: Optional local preview**

Run: `npm run dev`
Expected: local dev server starts and all three routes render correctly in the browser

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components frontend/src/pages frontend/src/style.css
git commit -m "style: polish legal learning workspace ui"
```

## Self-Review

### Spec Coverage

- Main layout and collapsible sidebar: covered in Tasks 1-2
- Home page initial and result states: covered in Task 3
- Notes page two-column knowledge browsing: covered in Task 4
- Insights page personal reflection layout: covered in Task 5
- Mock data only and no backend integration: covered across Tasks 3-5
- Tailwind-based polished styling and page differentiation: covered in Tasks 1 and 6

### Placeholder Scan

- No `TODO`, `TBD`, or “implement later” placeholders remain
- Every task includes exact files and concrete commands
- Code snippets define the shape and interfaces expected in implementation

### Type Consistency

- Routes consistently use `/home`, `/notes`, and `/insights`
- Shared layout prop names stay `pageTitle` and `pageDescription`
- Sidebar state names stay `isCollapsed` and `toggleSidebar`
- Page-level state names are consistent with the component contracts described above
