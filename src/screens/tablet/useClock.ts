import { useEffect, useState } from 'react'
import { locale, useLang } from '../../i18n'

const fmt = (d: Date) => {
  const l = locale()
  return {
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    // По-английски «Tuesday, 20 October», по-русски «вторник, 20 октября»
    date: `${d.toLocaleDateString(l, { weekday: 'long' })}, ${d.toLocaleDateString(l, { day: 'numeric', month: 'long' })}`,
  }
}

export function useClock() {
  const lang = useLang((s) => s.lang)
  const [tick, setTick] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setTick(new Date()), 10_000)
    return () => clearInterval(t)
  }, [])
  // lang в зависимостях не нужен: fmt читает текущий язык при каждой отрисовке
  void lang
  return fmt(tick)
}
