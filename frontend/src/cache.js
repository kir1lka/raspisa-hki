// Простой кэш на время жизни вкладки. Нужен, чтобы переключение
// между «Расписанием», «Студиями» и «Событиями» не показывало скелетоны
// заново: страницы монтируются с нуля, но данные берутся из памяти.
const store = new Map()

export function getCached(key) {
  return store.get(key)
}

export function loadCached(key, loader) {
  if (store.has(key)) return Promise.resolve(store.get(key))
  return loader().then((value) => {
    store.set(key, value)
    return value
  })
}

export function setCache(key, value) {
  store.set(key, value)
}

/** Сбросить кэш — после правок в админ-панели данные надо перечитать. */
export function dropCache(key) {
  if (key) store.delete(key)
  else store.clear()
}
