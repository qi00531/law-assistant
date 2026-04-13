import { ref } from 'vue'

const STORAGE_KEY = 'law-assistant.sidebar-collapsed'

const readStoredState = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.sessionStorage.getItem(STORAGE_KEY) === 'true'
}

export function useSidebar() {
  const isCollapsed = ref(readStoredState())

  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, String(isCollapsed.value))
    }
  }

  return {
    isCollapsed,
    toggleSidebar,
  }
}
