export const DAY_NAMES = {
  MONDAY: 'Понедельник', TUESDAY: 'Вторник', WEDNESDAY: 'Среда',
  THURSDAY: 'Четверг', FRIDAY: 'Пятница', SATURDAY: 'Суббота', SUNDAY: 'Воскресенье',
}

export const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export const hhmm = (t) => t.slice(0, 5)

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
