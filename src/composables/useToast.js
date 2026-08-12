import { reactive } from 'vue'

const state = reactive({ toasts: [] })
let nextId = 0

export function useToast() {
  function dismiss(id) {
    const index = state.toasts.findIndex((toast) => toast.id === id)
    if (index >= 0) state.toasts.splice(index, 1)
  }

  function show(message, { tone = 'info', duration = 4000 } = {}) {
    const id = ++nextId
    state.toasts.push({ id, message, tone })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  function success(message, options = {}) {
    return show(message, { tone: 'success', ...options })
  }

  function error(message, options = {}) {
    return show(message, { tone: 'danger', duration: 6000, ...options })
  }

  function info(message, options = {}) {
    return show(message, { tone: 'info', ...options })
  }

  function warning(message, options = {}) {
    return show(message, { tone: 'warning', duration: 5000, ...options })
  }

  return {
    toasts: state.toasts,
    show,
    success,
    error,
    info,
    warning,
    dismiss,
  }
}
