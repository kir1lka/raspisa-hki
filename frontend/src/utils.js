export const DAY_NAMES = {
  MONDAY: 'Понедельник', TUESDAY: 'Вторник', WEDNESDAY: 'Среда',
  THURSDAY: 'Четверг', FRIDAY: 'Пятница', SATURDAY: 'Суббота', SUNDAY: 'Воскресенье',
}

export const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export const hhmm = (t) => t.slice(0, 5)

export const MONTHS_SHORT_LOWER = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
]

/** «1 занятие», «3 занятия», «5 занятий» — русские окончания по числу. */
export function lessonsWord(n) {
  const mod100 = n % 100
  const mod10 = n % 10
  if (mod100 >= 11 && mod100 <= 14) return `${n} занятий`
  if (mod10 === 1) return `${n} занятие`
  if (mod10 >= 2 && mod10 <= 4) return `${n} занятия`
  return `${n} занятий`
}

export function shortName(full) {
  if (!full) return ''
  const parts = full.trim().split(/\s+/)
  if (parts.length < 2) return full
  const [last, ...rest] = parts
  const initials = rest.map((p) => p.charAt(0).toUpperCase() + '.').join(' ')
  return `${last} ${initials}`
}

export function endTime(t) {
  const [h, m] = t.split(':').map(Number)
  const total = h * 60 + m + 40
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function isCurrentLesson(lesson, now = new Date()) {
  const todayKey = DAY_ORDER[(now.getDay() + 6) % 7]
  if (lesson.dayOfWeek !== todayKey) return false
  const start = toMinutes(lesson.time)
  const cur = now.getHours() * 60 + now.getMinutes()
  return cur >= start && cur < start + 40
}
