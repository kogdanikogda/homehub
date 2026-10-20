import { DEVICE_BY_KEY, ROOM_NAMES } from '../../store/data'
import type { DeviceKey } from '../../store/types'
import { t } from '../../i18n'

/** Текст технического оповещения: «Living Room · Curtains are offline since 19:20.» */
export function offlineText(keys: DeviceKey[], since: string | null): string | null {
  if (!keys.length) return null
  const d = keys.map((k) => DEVICE_BY_KEY[k])
  const rooms = [...new Set(d.map((x) => ROOM_NAMES[x.room]))].join(', ')
  const names = d.map((x) => x.label).join(', ')
  const tail = since ? (d.length > 1 ? t('are offline since {since}.', { since }) : t('is offline since {since}.', { since })) : (d.length > 1 ? t('are offline.') : t('is offline.'))
  return `${rooms} · ${names} ${tail}`
}
