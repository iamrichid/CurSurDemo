import { ref, watch } from 'vue'

const THEME_KEY = 'any3mi-theme'
export const THEMES = ['flow', 'light', 'game']

const theme = ref(
  typeof localStorage !== 'undefined'
    ? localStorage.getItem(THEME_KEY) || 'flow'
    : 'flow'
)

const THEME_CLASS = {
  flow: 'dark-theme',
  light: 'light-theme',
  game: 'game-theme',
}

const THEME_LABEL = {
  flow: 'Dark',
  light: 'Light',
  game: 'Game',
}

function applyTheme(id) {
  const root = document.documentElement
  root.classList.remove('dark-theme', 'light-theme', 'game-theme')
  root.classList.add(THEME_CLASS[id] || 'dark-theme')
}

if (typeof document !== 'undefined') {
  applyTheme(theme.value)
}

watch(theme, (id) => {
  applyTheme(id)
  localStorage.setItem(THEME_KEY, id)
})

export function useTheme() {
  function cycleTheme() {
    const index = THEMES.indexOf(theme.value)
    theme.value = THEMES[(index + 1) % THEMES.length]
  }

  function setTheme(id) {
    if (THEMES.includes(id)) theme.value = id
  }

  function themeLabel(id = theme.value) {
    return THEME_LABEL[id] || 'Dark'
  }

  function themeAbbr(id = theme.value) {
    return { flow: 'Dk', light: 'Lt', game: 'Gm' }[id] || 'Dk'
  }

  return { theme, cycleTheme, setTheme, themeLabel, themeAbbr, THEMES }
}
