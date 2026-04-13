<script setup lang="ts">
defineProps<{
  labels: string[]
  disabled?: boolean
  pendingLabel?: string | null
}>()

const emit = defineEmits<{
  (event: 'select', label: string): void
}>()
</script>

<template>
  <section class="surface-card p-5">
    <div class="flex flex-wrap gap-3">
      <button
        v-for="label in labels"
        :key="label"
        type="button"
        class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-brand/30 hover:bg-brandSoft hover:text-brand disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        :disabled="disabled"
        @click="emit('select', label)"
      >
        {{ pendingLabel === label ? `${label}中…` : label }}
      </button>
    </div>
  </section>
</template>
