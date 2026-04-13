<script setup lang="ts">
import { useRoute } from 'vue-router'

import { useHomepageTheme } from '../composables/useHomepageTheme'
import NavItem from './NavItem.vue'

defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const route = useRoute()
const { theme, toggleTheme } = useHomepageTheme()

const navItems = [
  { label: '首页问答', icon: '法', to: '/home' },
  { label: '卡片库', icon: '卡', to: '/notes' },
  { label: '学习记录', icon: '录', to: '/insights' },
]

const isItemActive = (to: string) =>
  route.path === to ||
  route.path.startsWith(`${to}/`) ||
  route.matched.some((record) => record.path === to)
</script>

<template>
  <aside
    class="sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/70 bg-white/80 px-3 py-4 backdrop-blur"
    :class="collapsed ? 'w-[72px]' : 'w-[240px]'"
  >
    <div class="mb-6 flex items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-3 overflow-hidden">
        <div
          class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-sm font-semibold text-white"
        >
          法
        </div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-900">法小智</p>
          <p class="truncate text-xs text-slate-500">Legal Learning Workspace</p>
        </div>
      </div>
      <button
        class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100"
        type="button"
        @click="emit('toggle')"
      >
        {{ collapsed ? '›' : '‹' }}
      </button>
    </div>

    <nav class="flex flex-1 flex-col gap-2">
      <NavItem
        v-for="item in navItems"
        :key="item.to"
        :active="isItemActive(item.to)"
        :collapsed="collapsed"
        :icon="item.icon"
        :label="item.label"
        :to="item.to"
      />
    </nav>

    <div class="mt-6 space-y-3">
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-3 text-left text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white"
        @click="toggleTheme"
      >
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-white">{{ theme === 'light' ? '☼' : '☾' }}</span>
        <div v-if="!collapsed" class="min-w-0">
          <p class="truncate text-sm font-medium text-slate-700">{{ theme === 'light' ? '浅色模式' : '深色模式' }}</p>
          <p class="truncate text-xs text-slate-400">点击切换主题</p>
        </div>
      </button>

      <div
        aria-hidden="true"
        class="flex cursor-default items-center gap-3 rounded-2xl bg-warm px-3 py-3"
      >
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-white font-semibold text-slate-700">
          Q
        </div>
        <div v-if="!collapsed" class="min-w-0">
          <p class="truncate text-sm font-medium text-slate-900">Qisen</p>
          <p class="truncate text-xs text-slate-500">账户信息占位</p>
        </div>
      </div>
    </div>
  </aside>
</template>
