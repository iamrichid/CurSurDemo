import { ref, watch } from 'vue'

const THEME_KEY = 'any3mi-theme'
const theme = ref(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem(THEME_KEY) || 'flow'
    : 'flow'
)

function applyTheme(id) {
  const root = document.documentElement
  root.classList.remove('dark-theme', 'game-theme')
  root.classList.add(id === 'game' ? 'game-theme' : 'dark-theme')
}

if (typeof document !== 'undefined') {
  applyTheme(theme.value)
}

watch(theme, (id) => {
  applyTheme(id)
  localStorage.setItem(THEME_KEY, id)
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'game' ? 'flow' : 'game'
  }

  function setTheme(id) {
    theme.value = id
  }

  return { theme, toggleTheme, setTheme }
}
