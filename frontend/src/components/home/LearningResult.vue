<script setup lang="ts">
import type { LearningModule } from '../../data/mockHomeData'

import LearningModuleCard from './LearningModuleCard.vue'

defineProps<{
  question: string
  modules: LearningModule[]
}>()

const emit = defineEmits<{
  (event: 'back'): void
}>()
</script>

<template>
  <section class="space-y-6">
    <div class="surface-card overflow-hidden">
      <div class="border-b border-slate-100 bg-gradient-to-r from-brandSoft via-white to-warm px-6 py-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand">当前学习问题</p>
            <h2 class="text-2xl font-semibold text-slate-900">{{ question }}</h2>
          </div>
          <button
            type="button"
            class="inline-flex w-fit items-center justify-center rounded-2xl border border-white bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
            @click="emit('back')"
          >
            返回首页
          </button>
        </div>
      </div>
      <div class="px-6 py-5">
        <p class="max-w-3xl text-sm leading-7 text-slate-600">
          我们将这个问题整理成概念、条件、案例、误区和相关法条，方便你快速建立完整理解。
        </p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <LearningModuleCard
        v-for="module in modules"
        :key="module.key"
        :content="module.content"
        :icon="module.icon"
        :title="module.title"
      />
    </div>
  </section>
</template>
