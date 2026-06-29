// Группа или преподаватель «по умолчанию»: при входе в приложение
// (стартовый маршрут «/») сразу открывается их расписание.
// Формат: { type: 'group' | 'teacher', value: number|string, label: string }
const KEY = 'default-selection'

export function getDefaultSelection() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setDefaultSelection(sel) {
  if (sel) localStorage.setItem(KEY, JSON.stringify(sel))
  else localStorage.removeItem(KEY)
}

// Путь к расписанию сохранённого выбора, например '/group/101' или '/teacher/5'.
export function defaultSelectionPath(sel, base = '') {
  if (!sel) return null
  return sel.type === 'teacher' ? `${base}/teacher/${sel.value}` : `${base}/group/${sel.value}`
}
