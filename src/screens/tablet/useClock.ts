import { useEffect, useState } from 'react'

const fmt = (d: Date) => ({
  time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  date: `${d.toLocaleDateString('en-GB', { weekday: 'long' })}, ${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'long' })}`,
})

export function useClock() {
  const [now, setNow] = useState(() => fmt(new Date()))
  useEffect(() => {
    const t = setInterval(() => setNow(fmt(new Date())), 10_000)
    return () => clearInterval(t)
  }, [])
  return now
}
