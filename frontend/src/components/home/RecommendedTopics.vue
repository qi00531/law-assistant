<script setup lang="ts">
defineProps<{
  topics: string[]
}>()

const emit = defineEmits<{
  (event: 'select', topic: string): void
}>()
</script>

<template>
  <section class="surface-card p-6">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-1">
        <p class="text-sm font-semibold text-slate-900">推荐主题</p>
        <p class="text-sm text-slate-500">从高频法律知识点开始，快速进入学习状态。</p>
      </div>
    </div>

    <div class="mt-5 flex flex-wrap gap-3">
      <button
        v-for="topic in topics"
        :key="topic"
        type="button"
        class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brandSoft hover:text-brand"
        @click="emit('select', topic)"
      >
        {{ topic }}
      </button>
    </div>
  </section>
</template>
