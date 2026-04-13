import { computed, ref, watch } from 'vue'

import type { HomepageTheme } from '../types/homeTimeline'

const STORAGE_KEY = 'law-assistant-homepage-theme'
const theme = ref<HomepageTheme>('light')

if (typeof window !== 'undefined') {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    theme.value = savedTheme
  }
}

watch(
  theme,
  (value) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, value)
    document.documentElement.dataset.homeTheme = value
  },
  { immediate: true },
)

export const useHomepageTheme = () => {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme: computed(() => theme.value),
    toggleTheme,
  }
}
