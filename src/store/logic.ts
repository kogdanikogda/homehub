import {
  AWAY_CLIMATE, CORRIDOR_TEMP, DEVICES, DEVICE_BY_KEY, PRIVATE_CLIMATE, ROOM_NAMES, SCENES,
  type DeviceValues,
} from './data'
import type { Change, DeviceKey, DeviceValue, ExtraKey, Mode, RoomId, SceneId } from './types'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Как значение выглядит на экране: «Off», «80%», «22°», «Low» */
export function formatValue(key: DeviceKey, v: DeviceValue): string {
  const kind = DEVICE_BY_KEY[key].kind
  if (kind === 'dimmer') return v === 0 ? 'Off' : `${v}%`
  if (kind === 'climate') return `${v}°`
  if (kind === 'toggle') return v ? 'On' : 'Off'
  return cap(String(v))
}

export function deviceTitle(key: DeviceKey): string {
  const d = DEVICE_BY_KEY[key]
  return `${ROOM_NAMES[d.room]} · ${d.label}`
}

/** Что изменится, если применить значения сцены к текущему состоянию */
export function diffToScene(devices: DeviceValues, scene: SceneId): Change[] {
  const target = SCENES[scene].values
  return DEVICES.filter((d) => devices[d.key] !== target[d.key]).map((d) => ({
    key: d.key, from: devices[d.key], to: target[d.key],
  }))
}

/** Сцена «изменена», когда текущее состояние отличается от сохранённого */
export function modifiedChanges(devices: DeviceValues, active: SceneId | null, ignore: DeviceKey[] = []): Change[] {
  return active ? diffToScene(devices, active).filter((c) => !ignore.includes(c.key)) : []
}

/** Cinema → Night: ТВ и звук выключатся — это нужно подтвердить */
export function conflictTurnOff(devices: DeviceValues, active: SceneId | null, target: SceneId): Change[] {
  if (active !== 'cinema' || target !== 'night') return []
  return diffToScene(devices, target).filter(
    (c) => (c.key === 'living.tv' || c.key === 'living.sound') && c.from === true && c.to === false,
  )
}

/** Средняя температура дома: пять комнат с климатом; в Away/Vacation все на энергосбережении */
export function averageTemperature(devices: DeviceValues, mode: Mode): number {
  const priv = Object.values(PRIVATE_CLIMATE).map((t) => (mode === 'home' ? t : AWAY_CLIMATE))
  const temps = [devices['living.climate'], devices['kitchen.climate']].map(Number).concat(priv)
  return temps.reduce((a, b) => a + b, 0) / temps.length
}

export function windowsText(open: RoomId[]): string {
  if (open.length === 0) return 'All closed'
  return `${open.length} open`
}

export function windowAlertText(open: RoomId[]): string {
  if (open.length === 1) return `${ROOM_NAMES[open[0]]} window is open`
  return `${open.length} windows are open: ${open.map((r) => ROOM_NAMES[r]).join(', ')}`
}

export function clampTemp(v: number, limits: { min: number; max: number }): number {
  return Math.min(limits.max, Math.max(limits.min, v))
}

/** Включено ли устройство (для подсчёта «N on»): климат и шторы не считаются */
export function isOn(key: DeviceKey, v: DeviceValue): boolean {
  const kind = DEVICE_BY_KEY[key].kind
  if (kind === 'dimmer') return Number(v) > 0
  if (kind === 'toggle') return Boolean(v)
  if (kind === 'rgb') return v !== 'off'
  return false
}

/** Температура комнаты для списка: «22°» */
export function roomTemperature(room: RoomId, devices: DeviceValues): number {
  if (room === 'living') return Number(devices['living.climate'])
  if (room === 'kitchen') return Number(devices['kitchen.climate'])
  if (room === 'corridor') return CORRIDOR_TEMP
  return PRIVATE_CLIMATE[room as keyof typeof PRIVATE_CLIMATE]
}

/** Сколько устройств включено в комнате */
export function onCount(room: RoomId, devices: DeviceValues, extras: Record<ExtraKey, boolean>): number {
  const own = DEVICES.filter((d) => d.room === room && isOn(d.key, devices[d.key])).length
  const more = room === 'kitchen' ? Object.values(extras).filter(Boolean).length : 0
  return own + more
}

/** Подпись в списке комнат: «22° · 2 on» или «21° · All off» */
export function roomSummary(temp: number, on: number): string {
  return `${temp}° · ${on === 0 ? 'All off' : `${on} on`}`
}

/** Устройство «принадлежит» сцене: медиа — только если сцена его включает */
export function isSceneControlled(key: DeviceKey, scene: SceneId): boolean {
  const d = DEVICE_BY_KEY[key]
  const media = d.icon === 'tv' || d.icon === 'sound'
  return !media || SCENES[scene].values[key] === true
}

/** Сколько устройств комнаты задаёт сцена */
export function sceneControlledCount(room: RoomId, scene: SceneId): number {
  return DEVICES.filter((d) => d.room === room && isSceneControlled(d.key, scene)).length
}
