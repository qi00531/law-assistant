# Marketing Homepage Learning Capsule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a marketing homepage that uses Aceternity-style layout and motion patterns to explain the AI legal learning product and drive visitors to click “开始学习”.

**Architecture:** Keep the current Vue 3 + Tailwind app structure, but introduce a dedicated marketing route and a focused set of `components/marketing/*` sections. The homepage will be a composition page that pulls in curated image resources, Aceternity-inspired background effects, and a bento-style capability grid without importing React-only Aceternity code directly.

**Tech Stack:** Vue 3, Vue Router, Tailwind CSS, Vite, TypeScript, external image resources (unDraw, Pexels, Picsum), Iconify icons as inline SVG references or Vue wrappers

---

## File Map

- Modify: `frontend/src/router/index.ts`
  Purpose: add a marketing homepage route and decide whether it becomes the root route.
- Modify: `frontend/src/style.css`
  Purpose: add reusable marketing tokens, background helpers, and section-level utility classes.
- Create: `frontend/src/pages/MarketingHomePage.vue`
  Purpose: compose the full landing page from dedicated marketing sections.
- Create: `frontend/src/components/marketing/MarketingNav.vue`
  Purpose: top navigation and main CTA cluster.
- Create: `frontend/src/components/marketing/HeroSection.vue`
  Purpose: Aceternity-inspired hero with animated background, headline, CTAs, and product preview.
- Create: `frontend/src/components/marketing/FeatureBentoGrid.vue`
  Purpose: bento-style capability grid that explains the product is not a generic chatbot.
- Create: `frontend/src/components/marketing/LearningFlowSection.vue`
  Purpose: three-step learning loop with illustration support.
- Create: `frontend/src/components/marketing/AudienceSection.vue`
  Purpose: target audience / scenarios section using real photography.
- Create: `frontend/src/components/marketing/ProductPreviewSection.vue`
  Purpose: showcase actual product UI screenshots / mockups.
- Create: `frontend/src/components/marketing/BottomCtaSection.vue`
  Purpose: final CTA close.
- Create: `frontend/src/data/marketingHomeData.ts`
  Purpose: centralize homepage content, asset URLs, icon identifiers, and card copy.

## Task 1: Prepare Route, Asset Data, And Global Marketing Tokens

**Files:**
- Modify: `frontend/src/router/index.ts`
- Modify: `frontend/src/style.css`
- Create: `frontend/src/data/marketingHomeData.ts`

- [ ] **Step 1: Make the marketing homepage the app entry route**

Update `frontend/src/router/index.ts` so `/` renders the marketing homepage directly, while preserving existing app pages.

```ts
import { createRouter, createWebHistory } from 'vue-router'

import MarketingHomePage from '../pages/MarketingHomePage.vue'
import HomePage from '../pages/HomePage.vue'
import NotesPage from '../pages/NotesPage.vue'
import InsightsPage from '../pages/InsightsPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MarketingHomePage },
    { path: '/app', redirect: '/home' },
    { path: '/home', component: HomePage },
    { path: '/notes', component: NotesPage },
    { path: '/insights', component: InsightsPage },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
```

- [ ] **Step 2: Create a centralized data file for copy, icons, and remote assets**

Create `frontend/src/data/marketingHomeData.ts` and keep all section content there so the page components remain presentation-focused.

```ts
export const marketingHero = {
  eyebrow: 'AI 法律学习助手',
  title: '把法律问题拆成真正能学会的知识结构',
  description:
    '不是聊天记录，不是长篇回答，而是把概念、法条、案例、易混点和笔记沉淀组织成一条清晰的学习路径。',
  primaryCta: { label: '开始学习', href: '/home' },
  secondaryCta: { label: '查看演示', href: '#product-preview' },
}

export const marketingFeatures = [
  {
    title: '结构化拆解问题',
    description: '把一个法律问题拆成概念、构成要件、法条、案例和误区。',
    icon: 'solar:document-text-linear',
  },
  {
    title: '快速理解易混概念',
    description: '直接对比相近概念，减少死记硬背式学习。',
    icon: 'solar:scales-linear',
  },
  {
    title: '一键沉淀为笔记',
    description: '把本次学习结果变成可回看、可复习的知识卡片。',
    icon: 'solar:notebook-bookmark-linear',
  },
  {
    title: '为法考与课程复习服务',
    description: '适合法学生、法考备考者和法律初学者的持续学习节奏。',
    icon: 'solar:clipboard-list-linear',
  },
]

export const learningFlowSteps = [
  {
    title: '提出问题',
    description: '从一个概念、一个案例或者一个“有什么区别”开始。',
  },
  {
    title: '获得结构化讲解',
    description: '系统输出概念、要点、误区、法条和易混项，而不是一整段闲聊。',
  },
  {
    title: '保存笔记并持续复习',
    description: '把学习结果沉淀下来，形成可以不断回看的个人知识库。',
  },
]

export const audienceCards = [
  {
    title: '法学生',
    description: '适合课后补理解、案例梳理和考试前复盘。',
  },
  {
    title: '法考备考者',
    description: '从易混概念和构成要件入手，形成稳定的答题框架。',
  },
  {
    title: '法律初学者',
    description: '先理解，再记忆，不被术语和法条结构劝退。',
  },
]

export const illustrationUrl = 'https://undraw.co/api/illustrations/undraw_education_f8ru.svg'
export const audiencePhotoUrl =
  'https://images.pexels.com/photos/4778611/pexels-photo-4778611.jpeg?auto=compress&cs=tinysrgb&w=1200'
export const placeholderPreview = 'https://picsum.photos/1200/800?blur=0'
```

- [ ] **Step 3: Add marketing-specific global styles and reusable section helpers**

Update `frontend/src/style.css` with homepage-only helpers instead of scattering large one-off utility stacks everywhere.

```css
@layer base {
  body {
    @apply bg-[#f3fbf9] text-slate-900 antialiased;
    margin: 0;
    background-image:
      radial-gradient(circle at top, rgba(103, 232, 249, 0.18), transparent 26%),
      radial-gradient(circle at 80% 20%, rgba(52, 211, 153, 0.16), transparent 20%),
      linear-gradient(180deg, #f8fffd 0%, #f5fbfa 48%, #eef7f5 100%);
  }
}

@layer components {
  .marketing-shell {
    @apply relative mx-auto flex w-full max-w-[1440px] flex-col gap-24 px-5 pb-20 pt-6 sm:px-8 lg:px-10;
  }

  .marketing-section {
    @apply relative z-10;
  }

  .marketing-glass {
    @apply rounded-[28px] border border-white/70 bg-white/70 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl;
  }

  .marketing-chip {
    @apply inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.05)];
  }
}
```

- [ ] **Step 4: Run a build after route + style + data setup**

Run: `npm run build`

Expected: PASS, with the new route and data file compiling cleanly.

- [ ] **Step 5: Commit the homepage foundation**

```bash
git add frontend/src/router/index.ts frontend/src/style.css frontend/src/data/marketingHomeData.ts
git commit -m "feat: add marketing homepage foundation"
```

## Task 2: Build The Hero And Navigation With Aceternity-Style Motion

**Files:**
- Create: `frontend/src/components/marketing/MarketingNav.vue`
- Create: `frontend/src/components/marketing/HeroSection.vue`
- Create: `frontend/src/pages/MarketingHomePage.vue`

- [ ] **Step 1: Create a focused marketing navigation bar**

Create `frontend/src/components/marketing/MarketingNav.vue` to hold brand, lightweight nav links, and the main CTA.

```vue
<script setup lang="ts">
defineProps<{
  primaryHref: string
}>()
</script>

<template>
  <header class="marketing-section">
    <nav class="marketing-glass flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
      <div class="flex items-center gap-3">
        <div class="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500 text-white shadow-[0_12px_24px_rgba(16,185,129,0.28)]">
          法
        </div>
        <div>
          <p class="text-base font-semibold text-slate-900">Law Assistant</p>
          <p class="text-sm text-slate-500">AI 法律学习助手</p>
        </div>
      </div>

      <div class="hidden items-center gap-6 text-sm text-slate-600 md:flex">
        <a href="#features" class="transition hover:text-slate-900">核心能力</a>
        <a href="#learning-flow" class="transition hover:text-slate-900">学习流程</a>
        <a href="#product-preview" class="transition hover:text-slate-900">产品预览</a>
      </div>

      <a
        :href="primaryHref"
        class="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        开始学习
      </a>
    </nav>
  </header>
</template>
```

- [ ] **Step 2: Create the hero section with animated background layers and a product preview panel**

Create `frontend/src/components/marketing/HeroSection.vue`.

```vue
<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  previewImage: string
}>()
</script>

<template>
  <section class="marketing-section relative overflow-hidden rounded-[40px] px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
    <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
      <div class="absolute inset-x-10 top-0 h-40 rounded-full bg-cyan-200/40 blur-3xl"></div>
      <div class="absolute -right-16 top-24 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl"></div>
      <div class="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-sky-200/30 blur-3xl"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>
    </div>

    <div class="relative z-10 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div class="space-y-7">
        <span class="marketing-chip">{{ eyebrow }}</span>
        <div class="space-y-5">
          <h1 class="max-w-3xl font-serif text-4xl leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            {{ title }}
          </h1>
          <p class="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            {{ description }}
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <a
            :href="primaryCta.href"
            class="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            {{ primaryCta.label }}
          </a>
          <a
            :href="secondaryCta.href"
            class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            {{ secondaryCta.label }}
          </a>
        </div>
      </div>

      <div class="marketing-glass overflow-hidden p-3">
        <img
          :src="previewImage"
          alt="Law Assistant 产品界面预览"
          class="w-full rounded-[24px] object-cover shadow-[0_24px_50px_rgba(15,23,42,0.12)]"
        />
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Create the page shell that composes the marketing nav and hero**

Create `frontend/src/pages/MarketingHomePage.vue`.

```vue
<script setup lang="ts">
import HeroSection from '../components/marketing/HeroSection.vue'
import MarketingNav from '../components/marketing/MarketingNav.vue'
import { marketingHero, placeholderPreview } from '../data/marketingHomeData'
</script>

<template>
  <main class="marketing-shell">
    <MarketingNav :primary-href="marketingHero.primaryCta.href" />
    <HeroSection
      :eyebrow="marketingHero.eyebrow"
      :title="marketingHero.title"
      :description="marketingHero.description"
      :primary-cta="marketingHero.primaryCta"
      :secondary-cta="marketingHero.secondaryCta"
      :preview-image="placeholderPreview"
    />
  </main>
</template>
```

- [ ] **Step 4: Run a build to verify the new page entry renders**

Run: `npm run build`

Expected: PASS, with `/` now resolving to the new marketing page.

- [ ] **Step 5: Commit the hero shell**

```bash
git add frontend/src/components/marketing/MarketingNav.vue frontend/src/components/marketing/HeroSection.vue frontend/src/pages/MarketingHomePage.vue
git commit -m "feat: add marketing homepage hero"
```

## Task 3: Add The Aceternity-Inspired Capability Grid And Learning Flow

**Files:**
- Create: `frontend/src/components/marketing/FeatureBentoGrid.vue`
- Create: `frontend/src/components/marketing/LearningFlowSection.vue`
- Modify: `frontend/src/pages/MarketingHomePage.vue`

- [ ] **Step 1: Create a bento capability grid with consistent card rhythm**

Create `frontend/src/components/marketing/FeatureBentoGrid.vue`.

```vue
<script setup lang="ts">
defineProps<{
  items: Array<{ title: string; description: string; icon: string }>
}>()
</script>

<template>
  <section id="features" class="marketing-section space-y-6">
    <div class="max-w-2xl space-y-3">
      <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">核心能力</p>
      <h2 class="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
        不是聊天记录，而是一页一页可学习的法律知识结构
      </h2>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <article
        v-for="(item, index) in items"
        :key="item.title"
        class="marketing-glass group min-h-[220px] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.1)]"
        :class="index === 0 ? 'lg:col-span-2' : ''"
      >
        <div class="flex h-full flex-col justify-between gap-8">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <span class="text-sm font-semibold">{{ index + 1 }}</span>
          </div>
          <div class="space-y-3">
            <h3 class="text-xl font-semibold text-slate-900">{{ item.title }}</h3>
            <p class="text-sm leading-7 text-slate-600">{{ item.description }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Create the three-step learning flow section with illustration support**

Create `frontend/src/components/marketing/LearningFlowSection.vue`.

```vue
<script setup lang="ts">
defineProps<{
  steps: Array<{ title: string; description: string }>
  illustrationUrl: string
}>()
</script>

<template>
  <section id="learning-flow" class="marketing-section grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
    <div class="marketing-glass overflow-hidden p-4">
      <img :src="illustrationUrl" alt="学习流程插画" class="w-full rounded-[24px] bg-white object-contain p-6" />
    </div>

    <div class="space-y-6">
      <div class="space-y-3">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">学习流程</p>
        <h2 class="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
          从一个问题出发，形成完整的学习闭环
        </h2>
      </div>

      <div class="space-y-4">
        <article
          v-for="(step, index) in steps"
          :key="step.title"
          class="marketing-glass flex gap-4 p-5"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
            {{ index + 1 }}
          </div>
          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-slate-900">{{ step.title }}</h3>
            <p class="text-sm leading-7 text-slate-600">{{ step.description }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: Add the two sections to the marketing homepage**

Update `frontend/src/pages/MarketingHomePage.vue`.

```vue
<script setup lang="ts">
import FeatureBentoGrid from '../components/marketing/FeatureBentoGrid.vue'
import HeroSection from '../components/marketing/HeroSection.vue'
import LearningFlowSection from '../components/marketing/LearningFlowSection.vue'
import MarketingNav from '../components/marketing/MarketingNav.vue'
import {
  illustrationUrl,
  learningFlowSteps,
  marketingFeatures,
  marketingHero,
  placeholderPreview,
} from '../data/marketingHomeData'
</script>

<template>
  <main class="marketing-shell">
    <MarketingNav :primary-href="marketingHero.primaryCta.href" />
    <HeroSection ... />
    <FeatureBentoGrid :items="marketingFeatures" />
    <LearningFlowSection :steps="learningFlowSteps" :illustration-url="illustrationUrl" />
  </main>
</template>
```

- [ ] **Step 4: Run a build to verify new sections**

Run: `npm run build`

Expected: PASS, with all sections rendering and importing correctly.

- [ ] **Step 5: Commit the middle-page story sections**

```bash
git add frontend/src/components/marketing/FeatureBentoGrid.vue frontend/src/components/marketing/LearningFlowSection.vue frontend/src/pages/MarketingHomePage.vue
git commit -m "feat: add marketing homepage story sections"
```

## Task 4: Add Audience, Product Preview, And Bottom CTA

**Files:**
- Create: `frontend/src/components/marketing/AudienceSection.vue`
- Create: `frontend/src/components/marketing/ProductPreviewSection.vue`
- Create: `frontend/src/components/marketing/BottomCtaSection.vue`
- Modify: `frontend/src/pages/MarketingHomePage.vue`

- [ ] **Step 1: Create the audience / real-life study scene section**

Create `frontend/src/components/marketing/AudienceSection.vue`.

```vue
<script setup lang="ts">
defineProps<{
  audience: Array<{ title: string; description: string }>
  photoUrl: string
}>()
</script>

<template>
  <section class="marketing-section grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
    <div class="space-y-5">
      <div class="space-y-3">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">适用人群</p>
        <h2 class="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
          为真实的法律学习场景而设计
        </h2>
      </div>
      <div class="space-y-4">
        <article v-for="item in audience" :key="item.title" class="marketing-glass p-5">
          <h3 class="text-lg font-semibold text-slate-900">{{ item.title }}</h3>
          <p class="mt-2 text-sm leading-7 text-slate-600">{{ item.description }}</p>
        </article>
      </div>
    </div>

    <div class="marketing-glass overflow-hidden p-3">
      <img :src="photoUrl" alt="法律学习场景照片" class="h-full w-full rounded-[24px] object-cover" />
    </div>
  </section>
```

- [ ] **Step 2: Create a product preview section that shows multiple UI surfaces**

Create `frontend/src/components/marketing/ProductPreviewSection.vue`.

```vue
<script setup lang="ts">
defineProps<{
  previewImage: string
}>()
</script>

<template>
  <section id="product-preview" class="marketing-section space-y-6">
    <div class="max-w-2xl space-y-3">
      <p class="text-sm font-semibold uppercase tracking-[0.22em] text-sky-600">产品预览</p>
      <h2 class="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
        从提问到笔记，界面始终围绕“学习”而不是“闲聊”
      </h2>
    </div>

    <div class="marketing-glass overflow-hidden p-3">
      <img :src="previewImage" alt="Law Assistant 产品预览" class="w-full rounded-[28px] object-cover" />
    </div>
  </section>
```

- [ ] **Step 3: Create the bottom CTA close**

Create `frontend/src/components/marketing/BottomCtaSection.vue`.

```vue
<script setup lang="ts">
defineProps<{
  href: string
}>()
</script>

<template>
  <section class="marketing-section">
    <div class="marketing-glass relative overflow-hidden px-6 py-12 text-center sm:px-10">
      <div class="absolute inset-x-20 top-0 h-24 rounded-full bg-emerald-200/40 blur-3xl"></div>
      <div class="relative z-10 mx-auto max-w-3xl space-y-5">
        <h2 class="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
          从下一个法律问题开始，建立你自己的知识体系
        </h2>
        <p class="text-base leading-8 text-slate-600">
          把问题交给 AI 拆解，把结果沉淀成笔记，让每一次提问都变成一次真正的学习。
        </p>
        <a
          :href="href"
          class="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          开始学习
        </a>
      </div>
    </div>
  </section>
```

- [ ] **Step 4: Add these sections to the page composition**

Update `frontend/src/pages/MarketingHomePage.vue` to include `AudienceSection`, `ProductPreviewSection`, and `BottomCtaSection`.

- [ ] **Step 5: Run a build to verify the full page composition**

Run: `npm run build`

Expected: PASS, with the homepage fully rendering all sections and no route/import regressions.

- [ ] **Step 6: Commit the lower-page sections**

```bash
git add frontend/src/components/marketing/AudienceSection.vue frontend/src/components/marketing/ProductPreviewSection.vue frontend/src/components/marketing/BottomCtaSection.vue frontend/src/pages/MarketingHomePage.vue
git commit -m "feat: complete marketing homepage layout"
```

## Task 5: Refine The Page To Match Aceternity-Like Polish And Verify Assets

**Files:**
- Modify: `frontend/src/components/marketing/*.vue`
- Modify: `frontend/src/style.css`
- Modify: `frontend/src/data/marketingHomeData.ts`

- [ ] **Step 1: Replace any weak placeholder assets if better remote sources are available**

Keep these asset classes aligned with the spec:

```ts
// unDraw for illustration
export const illustrationUrl = '...'

// Pexels for real photo
export const audiencePhotoUrl = '...'

// Picsum only as temporary UI placeholder
export const placeholderPreview = '...'
```

- [ ] **Step 2: Add restrained reveal motion and hover polish**

Use light transitions only, for example:

```vue
class="transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.1)]"
```

```css
.marketing-fade-up {
  animation: marketing-fade-up 0.7s ease-out both;
}

@keyframes marketing-fade-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 3: Confirm all interactive elements have visible focus states and no horizontal scroll**

Run manual checks against:

```text
- nav links
- hero CTA buttons
- bento cards if clickable
- section anchor buttons
- mobile viewport widths
```

- [ ] **Step 4: Run final verification**

Run: `npm run build`

Expected: PASS, with no compile errors and the marketing homepage route working as the root entry.

- [ ] **Step 5: Commit the final polish**

```bash
git add frontend/src/style.css frontend/src/data/marketingHomeData.ts frontend/src/components/marketing frontend/src/pages/MarketingHomePage.vue frontend/src/router/index.ts
git commit -m "feat: polish marketing homepage"
```

## Self-Review

### Spec Coverage

- Hero + CTA: covered by Task 2.
- Aceternity-like visual language and motion: covered by Tasks 2 and 5.
- Bento capability explanation: covered by Task 3.
- Three-step learning loop with illustration: covered by Task 3.
- Audience credibility block with real photo: covered by Task 4.
- Product preview and bottom CTA: covered by Task 4.
- Asset source separation (unDraw, Pexels, Picsum, Iconify direction): covered by Tasks 1 and 5.

### Placeholder Scan

- No `TODO` or `TBD` placeholders remain.
- All file paths are exact.
- Commands are concrete and executable.

### Type Consistency

- `marketingHomeData.ts` defines the exact props needed by each section.
- Router import names and page/component names match the planned files.
- The page composition remains centered in `MarketingHomePage.vue`, while sections stay presentation-focused.

