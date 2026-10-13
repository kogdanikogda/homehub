import type { IconName } from '../components/Icon/Icon'

export type RoomId = 'living' | 'kitchen' | 'corridor' | 'kids1' | 'kids2' | 'bedroom'
/** Устройства дома, у каждого свои окна и уведомления */
export type DeviceId = 'tablet' | 'marina' | 'alexey'
export type Mode = 'home' | 'away' | 'vacation'
export type SceneId = 'general' | 'cinema' | 'night' | 'guests'

export type DeviceKey =
  | 'living.light' | 'living.rgb' | 'living.climate' | 'living.curtains' | 'living.tv' | 'living.sound'
  | 'kitchen.light' | 'kitchen.climate'
  | 'corridor.light'

/** dimmer 0–100 %, toggle вкл/выкл, rgb off|low|high, climate °C, curtains open|closed */
/** Дополнительные устройства кухни: сцены ими не управляют */
export type ExtraKey = 'kitchen.bar' | 'kitchen.floor'
/** Устройство, добавленное через телефон администратора */
export interface AddedDevice { id: number; name: string; room: RoomId; type: string; on: boolean }
export type PrivateRoomId = 'kids1' | 'kids2' | 'bedroom'
/** Устройства личных комнат: ими управляют только телефоны семьи */
export type PrivateKey = 'light' | 'climate' | 'humidifier' | 'curtains'
export interface PrivateState { light: boolean; climate: number; humidifier: boolean; curtains: 'open' | 'closed' }
export type PrivateRooms = Record<PrivateRoomId, PrivateState>

export type DeviceKind = 'dimmer' | 'toggle' | 'rgb' | 'climate' | 'curtains'
export type DeviceValue = number | boolean | string

export interface DeviceDef {
  key: DeviceKey
  room: RoomId
  label: string
  /** Короткое имя для уведомлений: «Kitchen light turned on» */
  short: string
  icon: IconName
  kind: DeviceKind
}

export interface Change {
  key: DeviceKey
  from: DeviceValue
  to: DeviceValue
}

export type ItemStatus = 'waiting' | 'running' | 'done' | 'failed'
export interface ProgressItem extends Change {
  status: ItemStatus
}

export type AlertKind = 'intrusion' | 'smoke'

export type DialogState =
  | { type: 'override'; key: DeviceKey; from: DeviceValue; to: DeviceValue; scene: SceneId }
  | { type: 'conflict'; target: SceneId; turnOff: Change[] }
  | { type: 'changes'; scene: SceneId }
  | { type: 'progress'; scene: SceneId; items: ProgressItem[]; phase: 'running' | 'done' | 'failed' }
  | { type: 'confirmAway'; windows: RoomId[] }
  | { type: 'pin'; purpose: 'home' | 'alarm' }
  | { type: 'windows' }
  | { type: 'energy' }

/** Шаги первой настройки панели */
export type OnboardingStep = 'welcome' | 'role' | 'pair' | 'declined' | 'done'
