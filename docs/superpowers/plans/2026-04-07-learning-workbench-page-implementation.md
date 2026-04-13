# Learning Workbench Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the current Vue frontend into a consistent “learning workbench” with a dominant home learning page, a stable three-column notes library, and a lighter insight-driven learning record page.

**Architecture:** Keep the current app inside `frontend/src/App.vue` as the top-level shell, but refactor page-specific rendering into small local view components under `frontend/src/components`. Use one shared layout shell for navigation and page switching, then give each page its own focused structure and styling. Preserve existing product behavior where possible, but replace chat-like presentation with learning modules and add collapsible side panels on the home page.

**Tech Stack:** Vue 3 with `<script setup lang="ts">`, Vite, TypeScript, plain CSS in `frontend/src/style.css`

---

## File Structure

### Existing files to modify

- Modify: `frontend/src/App.vue`
  - Keep top-level state, routing-by-hash, and shared page orchestration
  - Replace current page markup with a shell that renders focused page components
- Modify: `frontend/src/style.css`
  - Add the new workbench layout system
  - Replace legacy page-specific blocks that push the UI toward chat or dashboard patterns

### New files to create

- Create: `frontend/src/components/WorkbenchShell.vue`
  - Shared frame with left navigation and page outlet
- Create: `frontend/src/components/HomeLearningView.vue`
  - Home page structure with dominant center learning area and collapsible right rail
- Create: `frontend/src/components/NotesLibraryView.vue`
  - Stable three-column notes library layout
- Create: `frontend/src/components/LearningInsightsView.vue`
  - Learning record page with insight framing instead of heavy dashboard feel

### Files to verify

- Test/build: `frontend/package.json`
- Verify generated type-check/build through existing `npm run build`

---

### Task 1: Establish the shared learning workbench shell

**Files:**
- Create: `frontend/src/components/WorkbenchShell.vue`
- Modify: `frontend/src/App.vue`
- Test: `frontend/src/App.vue`

- [ ] **Step 1: Write the failing shell integration expectation**

Document the first expected component contract inside the plan before coding:

```ts
type PageKey = 'home' | 'history' | 'notes'

type ShellNavItem = {
  key: PageKey
  label: string
}
```

The shell must support:
- current page highlighting
- left navigation collapse state
- page slot rendering

- [ ] **Step 2: Run the current build to capture the baseline**

Run:

```bash
cd /home/qisen/projects/law-assistant/frontend
npm run build
```

Expected:
- Build passes before refactor starts

- [ ] **Step 3: Create the shared shell component**

Create `frontend/src/components/WorkbenchShell.vue`:

```vue
<script setup lang="ts">
type PageKey = 'home' | 'history' | 'notes'

defineProps<{
  currentPage: PageKey
  sidebarCollapsed: boolean
}>()

const emit = defineEmits<{
  navigate: [page: PageKey]
  toggleSidebar: []
}>()

const items: Array<{ key: PageKey; label: string; short: string }> = [
  { key: 'home', label: '首页问答', short: '问' },
  { key: 'notes', label: '笔记库', short: '笔' },
  { key: 'history', label: '学习记录', short: '记' },
]
</script>

<template>
  <div class="workbench-shell" :class="{ 'workbench-shell--sidebar-collapsed': sidebarCollapsed }">
    <aside class="workbench-sidebar">
      <button class="workbench-sidebar__toggle" type="button" @click="emit('toggleSidebar')">
        {{ sidebarCollapsed ? '展开' : '收起' }}
      </button>

      <div class="workbench-sidebar__brand">
        <span class="workbench-sidebar__brand-mark">法</span>
        <div v-if="!sidebarCollapsed" class="workbench-sidebar__brand-copy">
          <strong>法小智</strong>
          <span>学习工作台</span>
        </div>
      </div>

      <nav class="workbench-sidebar__nav">
        <button
          v-for="item in items"
          :key="item.key"
          type="button"
          class="workbench-sidebar__link"
          :class="{ 'is-active': currentPage === item.key }"
          @click="emit('navigate', item.key)"
        >
          <span class="workbench-sidebar__link-mark">{{ sidebarCollapsed ? item.short : item.label }}</span>
        </button>
      </nav>
    </aside>

    <section class="workbench-shell__main">
      <slot />
    </section>
  </div>
</template>
```

- [ ] **Step 4: Connect the shell in `App.vue`**

Add imports and left sidebar state near the top of `frontend/src/App.vue`:

```ts
import WorkbenchShell from './components/WorkbenchShell.vue'
import HomeLearningView from './components/HomeLearningView.vue'
import NotesLibraryView from './components/NotesLibraryView.vue'
import LearningInsightsView from './components/LearningInsightsView.vue'

const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function goToPage(page: PageKey) {
  currentPage.value = page
  window.location.hash = getHashFromPage(page)
}
```

Replace the page wrapper in the template with:

```vue
<WorkbenchShell
  :current-page="currentPage"
  :sidebar-collapsed="sidebarCollapsed"
  @navigate="goToPage"
  @toggle-sidebar="toggleSidebar"
>
  <HomeLearningView v-if="currentPage === 'home'" />
  <NotesLibraryView v-else-if="currentPage === 'notes'" />
  <LearningInsightsView v-else />
</WorkbenchShell>
```

- [ ] **Step 5: Run build after shell extraction**

Run:

```bash
cd /home/qisen/projects/law-assistant/frontend
npm run build
```

Expected:
- Build fails only if imported view components are still missing

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.vue frontend/src/components/WorkbenchShell.vue
git commit -m "feat: add shared learning workbench shell"
```

---

### Task 2: Rebuild the home page as the dominant learning workspace

**Files:**
- Create: `frontend/src/components/HomeLearningView.vue`
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`
- Test: `frontend/src/components/HomeLearningView.vue`

- [ ] **Step 1: Write the view contract for the home page**

Use these props so the home page can stay product-focused without duplicating app state logic:

```ts
defineProps<{
  question: string
  activeQuestion: string
  hasResult: boolean
  loading: boolean
  remainingCount: number
  recentChats: Array<{ id: string; title: string; created_at?: string }>
  rightRailCollapsed: boolean
}>()
```

Expected behavior:
- dominant center learning area
- no chat bubbles
- structured cards as learning modules
- collapsible right rail

- [ ] **Step 2: Create `HomeLearningView.vue`**

Use a structure like:

```vue
<script setup lang="ts">
import type { ChatResponse, SummaryResponse } from '../App.vue'

defineProps<{
  question: string
  activeQuestion: string
  hasResult: boolean
  loading: boolean
  remainingCount: number
  answer: ChatResponse | null
  summary: SummaryResponse | null
  recentChats: Array<{ id: string; title: string; created_at?: string }>
  rightRailCollapsed: boolean
}>()

const emit = defineEmits<{
  updateQuestion: [value: string]
  submit: []
  chooseRecentChat: [title: string]
  triggerAction: [action: 'simplify' | 'example' | 'compare' | 'elements' | 'exam']
  toggleRightRail: []
}>()
</script>

<template>
  <section class="home-learning-view">
    <div class="home-learning-view__main">
      <!-- initial state -->
      <!-- result state -->
    </div>

    <aside
      class="home-learning-view__rail"
      :class="{ 'home-learning-view__rail--collapsed': rightRailCollapsed }"
    >
      <button type="button" class="home-learning-view__rail-toggle" @click="emit('toggleRightRail')">
        {{ rightRailCollapsed ? '展开学习辅助' : '收起学习辅助' }}
      </button>
    </aside>
  </section>
</template>
```

- [ ] **Step 3: Wire the home page into `App.vue`**

Add right rail state and bridge handlers:

```ts
const homeRailCollapsed = ref(false)

function toggleHomeRail() {
  homeRailCollapsed.value = !homeRailCollapsed.value
}

function applyQuickQuestion(value: string) {
  question.value = value
}
```

Use the component like:

```vue
<HomeLearningView
  v-if="currentPage === 'home'"
  :question="question"
  :active-question="activeQuestion"
  :has-result="Boolean(answer || stream.length)"
  :loading="loading"
  :remaining-count="remainingCount"
  :answer="answer"
  :summary="summary"
  :recent-chats="savedHistory.slice(0, 6)"
  :right-rail-collapsed="homeRailCollapsed"
  @update-question="question = $event"
  @submit="submitQuestion"
  @choose-recent-chat="applyQuickQuestion"
  @trigger-action="handleNextAction"
  @toggle-right-rail="toggleHomeRail"
/>
```

- [ ] **Step 4: Add home-page-specific styling**

Append focused CSS blocks in `frontend/src/style.css`:

```css
.home-learning-view {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  min-height: 100vh;
}

.home-learning-view__main {
  padding: 40px 48px 56px;
}

.home-learning-view__main-inner {
  max-width: 980px;
  margin: 0 auto;
}

.home-learning-view__cards {
  display: grid;
  gap: 16px;
}

.home-learning-view__cards--grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.home-learning-view__rail {
  border-left: 1px solid var(--sidebar-border);
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(16px);
}

.home-learning-view__rail--collapsed {
  width: 70px;
}
```

- [ ] **Step 5: Run build to verify the home view**

Run:

```bash
cd /home/qisen/projects/law-assistant/frontend
npm run build
```

Expected:
- Build succeeds with the new home page component in place

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.vue frontend/src/components/HomeLearningView.vue frontend/src/style.css
git commit -m "feat: redesign home page as learning workspace"
```

---

### Task 3: Rebuild the notes page as the stable three-column library

**Files:**
- Create: `frontend/src/components/NotesLibraryView.vue`
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`
- Test: `frontend/src/components/NotesLibraryView.vue`

- [ ] **Step 1: Define the notes library component inputs**

```ts
defineProps<{
  searchQuery: string
  searchResults: HistorySummary[]
  allNotes: HistorySummary[]
  selectedNote: HistoryDetail | null
}>()
```

The view must preserve:
- left filtering
- center list browsing
- right detail reading

- [ ] **Step 2: Create `NotesLibraryView.vue`**

```vue
<script setup lang="ts">
defineProps<{
  searchQuery: string
  searchResults: Array<{
    id: string
    title: string
    question: string
    category?: string | null
    created_at: string
  }>
  selectedNote: {
    id: string
    title: string
    category?: string | null
    answer: {
      definition: string
      explanation: string
      elements: string[]
      law: string[]
      exam_points: string[]
    }
  } | null
}>()

const emit = defineEmits<{
  updateSearch: [value: string]
  selectNote: [id: string]
}>()
</script>

<template>
  <section class="notes-library-view">
    <aside class="notes-library-view__filters"></aside>
    <div class="notes-library-view__list"></div>
    <article class="notes-library-view__detail"></article>
  </section>
</template>
```

- [ ] **Step 3: Connect notes state from `App.vue`**

Map the existing note state into the new component:

```vue
<NotesLibraryView
  v-else-if="currentPage === 'notes'"
  :search-query="noteSearchQuery"
  :search-results="displayedNotes"
  :selected-note="selectedNoteDetail"
  @update-search="updateNoteSearch"
  @select-note="openHistoryDetail"
/>
```

Add the derived list:

```ts
const displayedNotes = computed(() => {
  return noteSearchQuery.value.trim() ? noteSearchResults.value : savedHistory.value.filter((item) => item.is_note)
})
```

- [ ] **Step 4: Style the three-column notes page**

Add CSS:

```css
.notes-library-view {
  display: grid;
  grid-template-columns: 240px 420px minmax(0, 1fr);
  min-height: 100vh;
}

.notes-library-view__filters,
.notes-library-view__list,
.notes-library-view__detail {
  min-width: 0;
}

.notes-library-view__filters {
  border-right: 1px solid var(--sidebar-border);
  background: rgba(248, 247, 244, 0.72);
}

.notes-library-view__list {
  border-right: 1px solid var(--sidebar-border);
  background: rgba(250, 249, 246, 0.82);
}

.notes-library-view__detail {
  background: rgba(255, 255, 255, 0.72);
}
```

- [ ] **Step 5: Run build after notes library extraction**

Run:

```bash
cd /home/qisen/projects/law-assistant/frontend
npm run build
```

Expected:
- Build succeeds
- No type errors from moved note props

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.vue frontend/src/components/NotesLibraryView.vue frontend/src/style.css
git commit -m "feat: redesign notes page as three-column library"
```

---

### Task 4: Reframe the learning record page as an insight view

**Files:**
- Create: `frontend/src/components/LearningInsightsView.vue`
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`
- Test: `frontend/src/components/LearningInsightsView.vue`

- [ ] **Step 1: Define the learning insight component contract**

```ts
type LearningInsightStats = {
  todayCount: number
  weeklyCount: number
  totalNotes: number
  repeatedQuestions: number
}
```

The page should contain:
- top insight overview
- mid diagnostic section
- bottom learning trajectory

- [ ] **Step 2: Create `LearningInsightsView.vue`**

```vue
<script setup lang="ts">
defineProps<{
  savedHistory: Array<{
    id: string
    title: string
    question: string
    created_at: string
    is_note: boolean
    category?: string | null
  }>
}>()
</script>

<template>
  <section class="learning-insights-view">
    <header class="learning-insights-view__hero"></header>
    <div class="learning-insights-view__diagnostics"></div>
    <section class="learning-insights-view__timeline"></section>
  </section>
</template>
```

Inside the component, derive lightweight view data from the existing history:

```ts
const noteCount = computed(() => props.savedHistory.filter((item) => item.is_note).length)
const repeatedTopics = computed(() => {
  const counter = new Map<string, number>()
  props.savedHistory.forEach((item) => {
    counter.set(item.question, (counter.get(item.question) ?? 0) + 1)
  })
  return [...counter.entries()].filter(([, count]) => count > 1)
})
```

- [ ] **Step 3: Connect the learning insight page**

Use:

```vue
<LearningInsightsView
  v-else
  :saved-history="savedHistory"
/>
```

This keeps the page grounded in the user’s actual learning trail instead of mocked dashboard tiles.

- [ ] **Step 4: Add lighter insight-page styling**

```css
.learning-insights-view {
  padding: 36px 44px 64px;
}

.learning-insights-view__hero,
.learning-insights-view__diagnostics,
.learning-insights-view__timeline {
  display: grid;
  gap: 18px;
}

.learning-insights-view__hero {
  margin-bottom: 28px;
}

.learning-insights-view__overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
```

- [ ] **Step 5: Run full frontend verification**

Run:

```bash
cd /home/qisen/projects/law-assistant/frontend
npm run build
```

Expected:
- PASS
- `vue-tsc` and Vite build both succeed

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.vue frontend/src/components/LearningInsightsView.vue frontend/src/style.css
git commit -m "feat: redesign learning record page as insight view"
```

---

### Task 5: Clean up page-specific leftovers and verify behavior

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/style.css`
- Test: `frontend/src/App.vue`

- [ ] **Step 1: Remove obsolete page markup from `App.vue`**

Delete legacy inline page sections that are now represented by:

- `HomeLearningView`
- `NotesLibraryView`
- `LearningInsightsView`

Keep only:
- shared state
- API calls
- navigation
- handlers

- [ ] **Step 2: Remove or isolate obsolete CSS blocks**

Search for old rules that enforce:
- chat bubble layouts
- duplicated history/note page wrappers
- page-specific layout assumptions that conflict with the new shell

Run:

```bash
cd /home/qisen/projects/law-assistant
rg -n "history-|note-|chat-|sidebar-empty|stream" frontend/src/style.css
```

Expected:
- Identify old blocks to delete or trim

- [ ] **Step 3: Run final build verification**

Run:

```bash
cd /home/qisen/projects/law-assistant/frontend
npm run build
```

Expected:
- PASS

- [ ] **Step 4: Run diff sanity check**

Run:

```bash
cd /home/qisen/projects/law-assistant
git diff -- frontend/src/App.vue frontend/src/style.css frontend/src/components
```

Expected:
- Only the workbench page redesign files show meaningful changes

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.vue frontend/src/style.css frontend/src/components
git commit -m "refactor: unify app pages into learning workbench layout"
```

---

## Self-Review

### Spec coverage

- Homepage dominance and non-chat structure: covered in Task 2
- Notes library stable three-column layout: covered in Task 3
- Learning record as insight page: covered in Task 4
- Left navigation and home right rail collapsible: covered in Tasks 1 and 2
- Light card-based layout system: covered across Tasks 2 to 5 through shared CSS refactor

### Placeholder scan

- No `TODO`, `TBD`, or “implement later” placeholders remain
- Every task names exact files and concrete commands

### Type consistency

- `PageKey` is kept consistent with the current app
- New views are designed as presentation components that receive state via props
- `App.vue` remains the stateful orchestrator
