<script setup lang="ts">
defineProps<{
  href: string
}>()
</script>

<template>
  <section class="marketing-section">
    <div class="marketing-glass relative overflow-hidden px-6 py-12 text-center sm:px-10">
      <div class="absolute inset-x-20 top-0 h-24 rounded-full bg-emerald-200/40 blur-3xl" />
      <div class="relative z-10 mx-auto max-w-3xl space-y-5">
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">06 / Final Invitation</p>
        <h2 class="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
          从下一个法律问题开始，建立你自己的知识体系
        </h2>
        <p class="text-base leading-8 text-slate-600">
          把问题交给 AI 拆解，把结果沉淀成笔记，让每一次提问都变成一次真正的学习。
        </p>
        <a
          :href="href"
          class="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          开始学习
        </a>
      </div>
    </div>
  </section>
</template>
