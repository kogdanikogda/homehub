import {
  AWAY_CLIMATE, DEVICES, DEVICE_BY_KEY, PRIVATE_CLIMATE, ROOM_NAMES, SCENES,
  type DeviceValues,
} from './data'
import type { Change, DeviceKey, DeviceValue, Mode, RoomId, SceneId } from './types'

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
