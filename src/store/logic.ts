import {
  AWAY_CLIMATE, CORRIDOR_TEMP, DEFAULT_SCENES, DEVICES, DEVICE_BY_KEY, INITIAL_PRIVATE, KITCHEN_EXTRAS, PRIVATE_DEVICES, ROOM_NAMES,
  type DeviceValues, type SceneMap,
} from './data'
import type { AddedDevice, Change, DeviceKey, ProgressItem, DeviceValue, ExtraKey, Mode, PrivateRoomId, PrivateRooms, PrivateState, RoomId, SceneId } from './types'

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

/** Сколько устройств включено в комнате (с добавленными через телефон администратора) */
export function onCount(room: RoomId, devices: DeviceValues, extras: Record<ExtraKey, boolean>, added: AddedDevice[] = []): number {
  const own = DEVICES.filter((d) => d.room === room && isOn(d.key, devices[d.key])).length
  const more = room === 'kitchen' ? Object.values(extras).filter(Boolean).length : 0
  return own + more + added.filter((d) => d.room === room && d.on).length
}

/** Сколько всего устройств в общей комнате: климат и шторы тоже считаются; кухня ещё подсветка столешницы и две допустройства */
export function deviceCount(room: RoomId, added: AddedDevice[] = []): number {
  const own = DEVICES.filter((d) => d.room === room).length
  const more = room === 'kitchen' ? 1 + KITCHEN_EXTRAS.length : 0
  return own + more + added.filter((d) => d.room === room).length
}

/** Сколько всего устройств в личной комнате */
export function privateDeviceCount(room: PrivateRoomId, added: AddedDevice[] = []): number {
  return PRIVATE_DEVICES[room].length + added.filter((d) => d.room === room).length
}

/** «1 of 6 devices on», «All devices off»: понятно без пояснений, сколько из скольких включено */
export function devicesOnText(on: number, total: number): string {
  if (total === 1) return on ? '1 device on' : 'Device off'
  if (on === 0) return 'All devices off'
  if (on === total) return `All ${total} devices on`
  return `${on} of ${total} devices on`
}

/** Подпись в списке комнат: «22° · 1 of 6 devices on» или «21° · All devices off» */
export function roomSummary(temp: number, on: number, total: number): string {
  return `${temp}° · ${devicesOnText(on, total)}`
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
export function privateOnCount(r: PrivateState, room?: PrivateRoomId, added: AddedDevice[] = []): number {
  return (r.light ? 1 : 0) + (r.humidifier ? 1 : 0) + (room ? added.filter((d) => d.room === room && d.on).length : 0)
}

/** Как значение личного устройства выглядит на экране */
export function formatPrivate(key: keyof PrivateState, r: PrivateState): string {
  if (key === 'climate') return `${r.climate}°`
  if (key === 'curtains') return r.curtains === 'open' ? 'Open' : 'Closed'
  return r[key] ? 'On' : 'Off'
}

/** Что изменится, если привести устройства к целевым значениям (для режимов Away/Vacation) */
export function diffValues(current: DeviceValues, target: DeviceValues): Change[] {
  return DEVICES.filter((d) => current[d.key] !== target[d.key]).map((d) => ({ key: d.key, from: current[d.key], to: target[d.key] }))
}

/** Служебные шаги: сигнализация и датчики безопасности */
export function sysItems(on: boolean): ProgressItem[] {
  return [
    { key: 'sys.alarm', from: !on, to: on, status: 'waiting' },
    { key: 'sys.sensors', from: !on, to: on, status: 'waiting' },
  ]
}

/** Строка шага прогресса: «Living Room · Main light: 80% → Off» или «Alarm: Off → On» */
export function progressText(i: Pick<ProgressItem, 'key' | 'from' | 'to'>): string {
  if (i.key === 'sys.alarm') return `Alarm: ${i.from ? 'On' : 'Off'} → ${i.to ? 'On' : 'Off'}`
  if (i.key === 'sys.sensors') return `Security sensors: ${i.from ? 'Active' : 'Inactive'} → ${i.to ? 'Active' : 'Inactive'}`
  return `${deviceTitle(i.key)}: ${formatValue(i.key, i.from)} → ${formatValue(i.key, i.to)}`
}

/* ============ Быстрый полный свет ============ */

/** Прежнее значение света комнаты, пока включён «Full light» */
export type LightHold = Partial<Record<RoomId, DeviceValue>>

/** Выключатель света общих комнат; в личных комнатах свет лежит в privateRooms */
export const LIGHT_KEY: Partial<Record<RoomId, DeviceKey>> = { living: 'living.light', kitchen: 'kitchen.light', corridor: 'corridor.light' }

/** Значение «полного света» для устройства: 100 % у диммера, «вкл» у выключателя */
export function fullValue(key: DeviceKey): DeviceValue {
  return DEVICE_BY_KEY[key].kind === 'dimmer' ? 100 : true
}

/** Устройства общих комнат, чей свет сейчас удерживается кнопкой «Full light»: сцена на них не обижается */
export function heldKeys(hold: LightHold): DeviceKey[] {
  return (Object.keys(hold) as RoomId[]).map((r) => LIGHT_KEY[r]).filter((k): k is DeviceKey => Boolean(k))
}

/**
 * Что показывать на месте кнопки света в комнате.
 * full — «Full light» (свет не на 100 %), back — «Back to previous light» (после нажатия), null — кнопки нет.
 * Только в режиме Home; если лампа не отвечает, кнопки тоже нет.
 */
export function lightButton(
  room: RoomId, mode: Mode, devices: DeviceValues, privateRooms: PrivateRooms, unresponsive: DeviceKey[], hold: LightHold,
): 'full' | 'back' | null {
  if (mode !== 'home') return null
  if (room in hold) return 'back'
  const key = LIGHT_KEY[room]
  if (key) return unresponsive.includes(key) || devices[key] === fullValue(key) ? null : 'full'
  return privateRooms[room as PrivateRoomId].light ? null : 'full'
}
