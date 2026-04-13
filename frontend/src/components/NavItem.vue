<script setup lang="ts">
defineProps<{
  label: string
  icon: string
  to: string
  active?: boolean
  collapsed?: boolean
}>()
</script>

<template>
  <RouterLink
    :to="to"
    class="group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition"
    :class="active ? 'bg-brandSoft text-brand' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
  >
    <span
      class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-base"
    >
      {{ icon }}
    </span>
    <span v-if="!collapsed" class="truncate">{{ label }}</span>
    <span
      v-if="collapsed"
      class="pointer-events-none absolute left-full top-1/2 z-10 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg group-hover:block"
    >
      {{ label }}
    </span>
  </RouterLink>
</template>
