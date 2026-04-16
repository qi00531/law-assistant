<script setup lang="ts">
import { computed } from 'vue'

import Sidebar from '../components/Sidebar.vue'
import { useHomepageTheme } from '../composables/useHomepageTheme'
import { useSidebar } from '../composables/useSidebar'

withDefaults(
  defineProps<{
    shellClass?: string
  }>(),
  {
    shellClass: '',
  },
)

const { isCollapsed, toggleSidebar } = useSidebar()
const { theme } = useHomepageTheme()
const appThemeClass = computed(() => (theme.value === 'dark' ? 'app-theme-dark' : 'app-theme-light'))
</script>

<template>
  <div class="min-h-screen bg-transparent text-ink transition-colors duration-200" :class="appThemeClass">
    <div class="mx-auto flex min-h-screen max-w-[1600px]">
      <Sidebar :collapsed="isCollapsed" @toggle="toggleSidebar" />
      <main class="min-w-0 flex-1">
        <div class="page-shell" :class="shellClass">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
