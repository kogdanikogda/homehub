import {
  AWAY_CLIMATE, CORRIDOR_TEMP, DEFAULT_SCENES, DEVICES, DEVICE_BY_KEY, INITIAL_PRIVATE, ROOM_NAMES,
  type DeviceValues, type SceneMap,
} from './data'
import type { Change, DeviceKey, DeviceValue, ExtraKey, Mode, PrivateRoomId, PrivateRooms, PrivateState, RoomId, SceneId } from './types'

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

/** Что изменится, если применить сцену к текущему состоянию: считаются только устройства из сцены */
export function diffToScene(devices: DeviceValues, scene: SceneId, scenes: SceneMap = DEFAULT_SCENES): Change[] {
  const target = scenes[scene]
  return DEVICES.filter((d) => d.key in target && devices[d.key] !== target[d.key]).map((d) => ({
    key: d.key, from: devices[d.key], to: target[d.key] as DeviceValue,
  }))
}

/** Сцена «изменена», когда текущее состояние отличается от сохранённого */
export function modifiedChanges(devices: DeviceValues, active: SceneId | null, ignore: DeviceKey[] = [], scenes: SceneMap = DEFAULT_SCENES): Change[] {
  return active ? diffToScene(devices, active, scenes).filter((c) => !ignore.includes(c.key)) : []
}

/** Cinema → Night: ТВ и звук выключатся — это нужно подтвердить */
export function conflictTurnOff(devices: DeviceValues, active: SceneId | null, target: SceneId, scenes: SceneMap = DEFAULT_SCENES): Change[] {
  if (active !== 'cinema' || target !== 'night') return []
  return diffToScene(devices, target, scenes).filter(
    (c) => (c.key === 'living.tv' || c.key === 'living.sound') && c.from === true && c.to === false,
  )
}

/** Средняя температура дома: пять комнат с климатом; в Away/Vacation все на энергосбережении */
export function averageTemperature(devices: DeviceValues, mode: Mode, privateRooms: PrivateRooms = INITIAL_PRIVATE): number {
  const priv = Object.values(privateRooms).map((r) => (mode === 'home' ? r.climate : AWAY_CLIMATE))
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
export function roomTemperature(room: RoomId, devices: DeviceValues, privateRooms: PrivateRooms = INITIAL_PRIVATE): number {
  if (room === 'living') return Number(devices['living.climate'])
  if (room === 'kitchen') return Number(devices['kitchen.climate'])
  if (room === 'corridor') return CORRIDOR_TEMP
  return privateRooms[room as PrivateRoomId].climate
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

/** Устройство входит в сцену */
export function isSceneControlled(key: DeviceKey, scene: SceneId, scenes: SceneMap = DEFAULT_SCENES): boolean {
  return key in scenes[scene]
}

/** Сколько устройств комнаты задаёт сцена */
export function sceneControlledCount(room: RoomId, scene: SceneId, scenes: SceneMap = DEFAULT_SCENES): number {
  return DEVICES.filter((d) => d.room === room && isSceneControlled(d.key, scene, scenes)).length
}

/** Сколько устройств включено в личной комнате: климат и шторы не считаются */
export function privateOnCount(r: PrivateState): number {
  return (r.light ? 1 : 0) + (r.humidifier ? 1 : 0)
}

/** Как значение личного устройства выглядит на экране */
export function formatPrivate(key: keyof PrivateState, r: PrivateState): string {
  if (key === 'climate') return `${r.climate}°`
  if (key === 'curtains') return r.curtains === 'open' ? 'Open' : 'Closed'
  return r[key] ? 'On' : 'Off'
}
