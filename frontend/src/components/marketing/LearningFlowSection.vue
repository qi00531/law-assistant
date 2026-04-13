<script setup lang="ts">
import { illustrationSource } from '../../data/marketingHomeData'

defineProps<{
  steps: Array<{ title: string; description: string }>
  illustrationUrl: string
}>()
</script>

<template>
  <section id="learning-flow" class="marketing-section grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
    <div class="marketing-glass overflow-hidden p-4">
      <div class="rounded-[24px] bg-[linear-gradient(180deg,#ffffff_0%,#f3fbf9_100%)] p-6">
        <img
          :src="illustrationUrl"
          alt="学习流程插画"
          class="mx-auto w-full max-w-[360px] rounded-[24px] bg-white p-4"
          loading="lazy"
        />

        <div class="mx-auto mt-6 flex max-w-[360px] flex-col gap-4">
          <div class="rounded-[24px] bg-emerald-50 p-4 shadow-[0_14px_34px_rgba(16,185,129,0.08)]">
            <p class="text-sm font-semibold text-emerald-700">提出问题</p>
            <p class="mt-2 text-sm leading-7 text-slate-700">从一个法条、概念或案例切口开始。</p>
          </div>
          <div class="rounded-[24px] bg-sky-50 p-4 shadow-[0_14px_34px_rgba(56,189,248,0.08)]">
            <p class="text-sm font-semibold text-sky-700">结构化讲解</p>
            <p class="mt-2 text-sm leading-7 text-slate-700">系统输出概念、要件、案例和易混点。</p>
          </div>
          <div class="rounded-[24px] bg-violet-50 p-4 shadow-[0_14px_34px_rgba(139,92,246,0.08)]">
            <p class="text-sm font-semibold text-violet-700">沉淀为笔记</p>
            <p class="mt-2 text-sm leading-7 text-slate-700">把一次提问变成持续复习的知识资产。</p>
          </div>
        </div>

        <a
          :href="illustrationSource.href"
          target="_blank"
          rel="noreferrer"
          class="mt-6 inline-flex text-xs font-medium text-slate-400 underline decoration-dotted underline-offset-4"
        >
          插画灵感来源：{{ illustrationSource.label }}
        </a>
      </div>
    </div>

    <div class="space-y-6">
      <div class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">03 / Workflow</p>
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
</template>
