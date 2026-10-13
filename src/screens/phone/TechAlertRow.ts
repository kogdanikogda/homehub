import { DEVICE_BY_KEY, ROOM_NAMES } from '../../store/data'
import type { DeviceKey } from '../../store/types'

/** Текст технического оповещения: «Living Room · Curtains are offline since 19:20.» */
export function offlineText(keys: DeviceKey[], since: string | null): string | null {
  if (!keys.length) return null
  const d = keys.map((k) => DEVICE_BY_KEY[k])
  const rooms = [...new Set(d.map((x) => ROOM_NAMES[x.room]))].join(', ')
  const names = d.map((x) => x.label).join(', ')
  return `${rooms} · ${names} ${d.length > 1 ? 'are' : 'is'} offline${since ? ` since ${since}` : ''}.`
}
