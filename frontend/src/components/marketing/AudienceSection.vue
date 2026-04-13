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
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">04 / Audience</p>
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
      <img :src="photoUrl" alt="法律学习场景照片" class="h-full w-full rounded-[24px] object-cover" loading="lazy" />
    </div>
  </section>
</template>
