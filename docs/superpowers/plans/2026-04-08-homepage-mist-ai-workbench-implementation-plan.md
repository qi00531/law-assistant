# Homepage Mist AI Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage into a light, misty AI workbench with a dominant input area, two-row quick-start rails, and a softer result state that stays visually consistent with the entry experience.

**Architecture:** Keep the current Vue 3 page flow and mock data, but refactor the homepage into a clearer composition: `MainLayout` provides the airy shell, `HomePage` owns the two-state flow, `QuestionInput` becomes the visual center, and the chips/result/action components adopt the same mist-green design tokens. Prefer focused component updates over structural rewrites so routing and sidebar behavior remain stable.

**Tech Stack:** Vue 3, `<script setup>`, Tailwind CSS utility classes, Vite, TypeScript, mock data modules in `frontend/src/data`

---

## File Map

- Modify: `frontend/src/style.css`
  Purpose: define reusable homepage surfaces and shared shell utilities that match the new mist AI aesthetic.
- Modify: `frontend/src/layouts/MainLayout.vue`
  Purpose: make the page shell lighter, more spacious, and visually aligned with the homepage redesign without breaking sidebar behavior.
- Modify: `frontend/src/pages/HomePage.vue`
  Purpose: orchestrate the initial state vs result state and establish the new visual hierarchy.
- Modify: `frontend/src/components/home/QuestionInput.vue`
  Purpose: turn the input into the homepage workbench with toolbar row, focused states, and disclaimer.
- Modify: `frontend/src/components/home/ExampleQuestionChips.vue`
  Purpose: render the “快速提问” rails as two auto-scrolling rows with opposite directions and fade edges.
- Modify: `frontend/src/components/home/LearningResult.vue`
  Purpose: make the result area feel like a modular study workspace rather than stacked heavy cards.
- Modify: `frontend/src/components/home/LearningActions.vue`
  Purpose: convert action buttons into a lighter follow-up action strip.
- Optional touch-up: `frontend/src/components/home/LearningModuleCard.vue`
  Purpose: only if needed to match the new result surface styling from `LearningResult`.

## Task 1: Establish Homepage Design Tokens And Shell

**Files:**
- Modify: `frontend/src/style.css`
- Modify: `frontend/src/layouts/MainLayout.vue`

- [ ] **Step 1: Replace the generic shell utilities with homepage-ready surface classes**

Update `frontend/src/style.css` so the app shell stops feeling like a flat white dashboard and instead exposes reusable utilities for mist surfaces, page gutters, and soft boundaries.

```css
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
      radial-gradient(circle at top, rgba(164, 214, 204, 0.24), transparent 28%),
      linear-gradient(180deg, #eef6f4 0%, #f6fbfa 44%, #f8fcfb 100%);
  }
}

@layer components {
  .surface-mist {
    @apply rounded-[28px] border border-white/70 bg-white/78 shadow-[0_18px_60px_rgba(44,93,83,0.08)] backdrop-blur-xl;
  }

  .surface-panel {
    @apply rounded-[24px] border border-slate-200/70 bg-white/88 shadow-[0_12px_36px_rgba(66,91,86,0.06)];
  }

  .page-shell {
    @apply mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-5 py-6 sm:px-6 lg:px-8;
  }
}
```

- [ ] **Step 2: Run a build after the token update**

Run: `npm run build`

Expected: build succeeds and no Tailwind utility or CSS syntax errors appear.

- [ ] **Step 3: Lighten the main layout without touching the sidebar logic**

Update `frontend/src/layouts/MainLayout.vue` so the content column gets more breathing room and a calmer background frame while preserving `useSidebar()`.

```vue
<template>
  <div class="min-h-screen bg-transparent text-ink">
    <div class="mx-auto flex min-h-screen w-full max-w-[1600px]">
      <Sidebar :collapsed="isCollapsed" @toggle="toggleSidebar" />
      <main class="min-w-0 flex-1">
        <div class="page-shell">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Re-run the build to verify the shell still compiles**

Run: `npm run build`

Expected: build succeeds and there are no template/type regressions from `MainLayout.vue`.

- [ ] **Step 5: Commit the shell baseline**

```bash
git add frontend/src/style.css frontend/src/layouts/MainLayout.vue
git commit -m "feat: establish homepage mist shell"
```

## Task 2: Rebuild The Question Input Into The Primary Workbench

**Files:**
- Modify: `frontend/src/components/home/QuestionInput.vue`

- [ ] **Step 1: Refactor the component API only as needed and keep the current submit contract**

Keep `v-model` and `submit` unchanged, but prepare the template for a three-part structure: input body, tool row, and disclaimer.

```ts
const props = withDefaults(
  defineProps<{
    modelValue: string
    buttonText?: string
    placeholder?: string
  }>(),
  {
    buttonText: '开始学习',
    placeholder: '输入法律问题，例如：什么是不安抗辩权',
  },
)
```

- [ ] **Step 2: Replace the old card-within-card template with a mist workbench**

Update `frontend/src/components/home/QuestionInput.vue` to use one dominant surface and a softer toolbar row.

```vue
<template>
  <section class="space-y-3">
    <div class="surface-mist overflow-hidden">
      <div class="px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
        <textarea
          ref="textareaRef"
          :value="modelValue"
          :placeholder="placeholder"
          rows="2"
          class="min-h-[104px] w-full resize-none border-0 bg-transparent text-[17px] leading-8 text-slate-800 outline-none placeholder:text-slate-400"
          @input="handleInput"
          @keydown="handleKeydown"
        />
      </div>

      <div class="flex flex-col gap-3 border-t border-slate-200/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span class="inline-flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-400/80"></span>
            AI 学习工作台
          </span>
          <span>按 Enter 提交，Shift + Enter 换行</span>
        </div>

        <div class="flex items-center gap-3 self-end sm:self-auto">
          <span class="text-sm font-medium text-slate-400">{{ modelValue.trim().length }}/200</span>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-[#7bb7ac] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#68a79b] disabled:cursor-not-allowed disabled:bg-slate-300"
            :disabled="!modelValue.trim()"
            @click="handleSubmit"
          >
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>

    <p class="px-2 text-center text-xs leading-6 text-slate-400">
      AI 生成内容仅用于辅助学习，请结合正式法条、判例和教材进行核对。
    </p>
  </section>
</template>
```

- [ ] **Step 3: Keep textarea auto-resize, but tune it to the new layout**

Adjust the resize logic to match the taller workbench while capping vertical growth.

```ts
const resize = () => {
  const element = textareaRef.value
  if (!element) return
  element.style.height = 'auto'
  const minHeight = 104
  const maxHeight = 220
  element.style.height = `${Math.min(Math.max(element.scrollHeight, minHeight), maxHeight)}px`
}
```

- [ ] **Step 4: Run the build after rebuilding the workbench**

Run: `npm run build`

Expected: build succeeds and the component keeps the same `submit`/`update:modelValue` behavior.

- [ ] **Step 5: Commit the new input workbench**

```bash
git add frontend/src/components/home/QuestionInput.vue
git commit -m "feat: redesign homepage question input"
```

## Task 3: Turn Quick Start Into Two Opposing Floating Rails

**Files:**
- Modify: `frontend/src/components/home/ExampleQuestionChips.vue`
- Modify: `frontend/src/pages/HomePage.vue`
- Modify: `frontend/src/data/mockHomeData.ts`

- [ ] **Step 1: Expand the homepage prompt dataset so two rows can scroll without looking repetitive**

Update `frontend/src/data/mockHomeData.ts` so the homepage has enough prompt density for two tracks.

```ts
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
```

- [ ] **Step 2: Replace the old grid chips with two marquee-style rows**

Refactor `frontend/src/components/home/ExampleQuestionChips.vue` so it accepts the same `questions` prop but renders split rows with opposite animation directions and edge masks.

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ questions: string[] }>()
const emit = defineEmits<{ (event: 'select', question: string): void }>()

const midpoint = computed(() => Math.ceil(props.questions.length / 2))
const topRow = computed(() => props.questions.slice(0, midpoint.value))
const bottomRow = computed(() => props.questions.slice(midpoint.value))
const duplicate = (items: string[]) => [...items, ...items]
</script>

<template>
  <section class="space-y-4">
    <p class="text-center text-sm font-semibold tracking-[0.18em] text-slate-500">快速提问</p>

    <div class="relative space-y-3 overflow-hidden">
      <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-[#f6fbfa] to-transparent"></div>
      <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-[#f6fbfa] to-transparent"></div>

      <div class="quick-start-rail quick-start-rail--forward">
        <button
          v-for="question in duplicate(topRow)"
          :key="`top-${question}`"
          type="button"
          class="quick-start-chip"
          @click="emit('select', question)"
        >
          {{ question }}
        </button>
      </div>

      <div class="quick-start-rail quick-start-rail--reverse">
        <button
          v-for="question in duplicate(bottomRow)"
          :key="`bottom-${question}`"
          type="button"
          class="quick-start-chip"
          @click="emit('select', question)"
        >
          {{ question }}
        </button>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Add the rail styles to the component and keep hover brighter than idle**

Add scoped styles in `ExampleQuestionChips.vue` for animation, hover pause, and chip contrast.

```css
<style scoped>
.quick-start-rail {
  display: flex;
  width: max-content;
  gap: 12px;
}

.quick-start-rail--forward {
  animation: quick-start-forward 24s linear infinite;
}

.quick-start-rail--reverse {
  animation: quick-start-reverse 26s linear infinite;
}

.quick-start-rail:hover {
  animation-play-state: paused;
}

.quick-start-chip {
  border-radius: 999px;
  border: 1px solid rgba(203, 213, 225, 0.9);
  background: rgba(255, 255, 255, 0.86);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: rgb(71 85 105);
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.quick-start-chip:hover {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(148, 163, 184, 0.95);
  color: rgb(30 41 59);
}

@keyframes quick-start-forward {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes quick-start-reverse {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
</style>
```

- [ ] **Step 4: Reorder the homepage entry layout so the chip rails sit clearly above the input**

Update `frontend/src/pages/HomePage.vue` initial state block to make the quick-start area feel intentional and spacious.

```vue
<template v-if="!isResultMode">
  <section class="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-10 pt-10 sm:pt-14">
    <div class="space-y-3 text-center">
      <p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Law Assistant</p>
      <h1 class="text-4xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-5xl">
        把卡住的法律问题交给 AI 一起拆解
      </h1>
      <p class="mx-auto max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
        从一个概念、一种区分、一个案例开始，逐步构建你的法律理解框架。
      </p>
    </div>

    <ExampleQuestionChips :questions="exampleQuestions" @select="handleExampleSelect" />
    <QuestionInput v-model="draftQuestion" @submit="handleDraftSubmit" />
  </section>
</template>
```

- [ ] **Step 5: Run the build and verify the homepage still enters result mode**

Run: `npm run build`

Expected: build succeeds, initial state shows two rails, and selecting or submitting a question still flips `isResultMode` to true.

- [ ] **Step 6: Commit the quick-start rail update**

```bash
git add frontend/src/data/mockHomeData.ts frontend/src/components/home/ExampleQuestionChips.vue frontend/src/pages/HomePage.vue
git commit -m "feat: add mist quick start rails to homepage"
```

## Task 4: Unify The Result State With The New Entry Experience

**Files:**
- Modify: `frontend/src/components/home/LearningResult.vue`
- Modify: `frontend/src/components/home/LearningActions.vue`
- Optional Modify: `frontend/src/components/home/LearningModuleCard.vue`
- Modify: `frontend/src/pages/HomePage.vue`

- [ ] **Step 1: Soften the result header so it feels like the same workbench, not a different page**

Update `frontend/src/components/home/LearningResult.vue` to use the new mist surface language and a calmer header.

```vue
<template>
  <section class="space-y-6">
    <div class="surface-mist overflow-hidden">
      <div class="border-b border-slate-200/70 px-6 py-5 sm:px-7">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f9f94]">当前学习问题</p>
            <h2 class="text-2xl font-semibold tracking-[-0.03em] text-slate-900">{{ question }}</h2>
          </div>
          <button
            type="button"
            class="inline-flex w-fit items-center justify-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white"
            @click="emit('back')"
          >
            返回重新提问
          </button>
        </div>
      </div>

      <div class="px-6 py-5 sm:px-7">
        <p class="max-w-3xl text-sm leading-7 text-slate-600">
          我们已按概念、构成条件、案例、误区和关联规则拆分这个问题，方便你一步步建立完整理解。
        </p>
      </div>
    </div>
```

- [ ] **Step 2: Make follow-up actions read like lightweight continuation tools**

Update `frontend/src/components/home/LearningActions.vue` so the actions become a soft strip rather than a bordered card.

```vue
<template>
  <section class="flex flex-wrap gap-3">
    <button
      v-for="label in labels"
      :key="label"
      type="button"
      class="rounded-full border border-slate-200/80 bg-white/86 px-4 py-3 text-sm font-medium text-slate-600 shadow-[0_8px_22px_rgba(71,85,105,0.06)] transition hover:border-[#7bb7ac]/50 hover:bg-[#eef8f5] hover:text-[#2f6f63]"
      @click="emit('select', label)"
    >
      {{ label }}
    </button>
  </section>
</template>
```

- [ ] **Step 3: If module cards still feel too heavy, flatten them just enough**

Only if the result grid still looks card-stacked, update `frontend/src/components/home/LearningModuleCard.vue` to a lighter surface.

```vue
<article class="rounded-[24px] border border-slate-200/70 bg-white/88 p-5 shadow-[0_10px_28px_rgba(71,85,105,0.05)]">
  <!-- preserve existing title/content structure -->
</article>
```

- [ ] **Step 4: Align the result-mode page layout with the entry-mode spacing**

Update `frontend/src/pages/HomePage.vue` result block so the input remains in the flow and the result modules sit below it.

```vue
<template v-else>
  <section class="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10 pt-8">
    <QuestionInput v-model="draftQuestion" @submit="handleDraftSubmit" />
    <LearningResult :modules="learningModules" :question="activeQuestion" @back="resetPage" />
    <LearningActions :labels="actionLabels" @select="handleActionSelect" />
  </section>
</template>
```

- [ ] **Step 5: Run the full verification pass**

Run: `npm run build`

Expected: build succeeds, both homepage states compile, and no component import/type regressions remain.

- [ ] **Step 6: Commit the result-state polish**

```bash
git add frontend/src/components/home/LearningResult.vue frontend/src/components/home/LearningActions.vue frontend/src/components/home/LearningModuleCard.vue frontend/src/pages/HomePage.vue
git commit -m "feat: unify homepage result state with mist workbench design"
```

## Self-Review

### Spec Coverage

- Visual direction and mist-green tone: covered by Task 1 and Task 2.
- Input workbench as sole visual center: covered by Task 2 and Task 3.
- Two-row quick-start rails with opposite directions and edge fade: covered by Task 3.
- Unified entry and result states: covered by Task 4.
- Responsive/no horizontal scroll requirements: covered by Task 1 shell sizing and Task 3 rail masking plus `max-content` marquee behavior.

### Placeholder Scan

- No `TODO`/`TBD` placeholders remain.
- Each task names exact files and concrete code shapes.
- Every verification step uses `npm run build`, which matches the current frontend toolchain.

### Type Consistency

- `QuestionInput` still emits `update:modelValue` and `submit`.
- `ExampleQuestionChips` still emits `select` with a `question: string`.
- `HomePage.vue` keeps `draftQuestion`, `activeQuestion`, and the existing result toggle logic.

