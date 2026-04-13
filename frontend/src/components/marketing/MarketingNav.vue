<script setup lang="ts">
defineProps<{
  primaryHref: string
}>()
</script>

<template>
  <header class="marketing-section">
    <nav class="marketing-glass flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
      <div class="flex items-center gap-3">
        <div
          class="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500 text-base font-bold text-white shadow-[0_12px_24px_rgba(16,185,129,0.28)]"
        >
          法
        </div>
        <div>
          <p class="text-base font-semibold text-slate-900">Law Assistant</p>
          <p class="text-sm text-slate-500">AI 法律学习助手</p>
        </div>
      </div>

      <div class="hidden items-center gap-6 text-sm text-slate-600 md:flex">
        <a href="#features" class="transition hover:text-slate-900 focus-visible:text-slate-900">核心能力</a>
        <a href="#learning-flow" class="transition hover:text-slate-900 focus-visible:text-slate-900">学习流程</a>
        <a href="#product-preview" class="transition hover:text-slate-900 focus-visible:text-slate-900">产品预览</a>
      </div>

      <a
        :href="primaryHref"
        class="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        开始学习
      </a>
    </nav>
  </header>
</template>
