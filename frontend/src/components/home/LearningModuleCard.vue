<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  content: string[]
}>()
</script>

<template>
  <article class="surface-card flex h-full flex-col gap-4 p-5">
    <div class="flex items-center gap-3">
      <div class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brandSoft text-sm font-semibold text-brand">
        {{ icon }}
      </div>
      <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
    </div>

    <div class="space-y-3 text-sm leading-7 text-slate-600">
      <p v-for="item in content" :key="item">{{ item }}</p>
    </div>
  </article>
</template>
