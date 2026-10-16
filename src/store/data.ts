import type { DeviceDef, DeviceKey, DeviceValue, ExtraKey, Mode, PrivateKey, PrivateRoomId, PrivateRooms, RoomId, SceneId } from './types'
import type { IconName } from '../components/Icon/Icon'

export const HOUSE_NAME = 'Home on Birch Street 12'
/** Прототипный PIN (показывается подсказкой на экране) */
export const PROTOTYPE_PIN = '1234'
/** Глобальный диапазон температур — настраивается только в админке */
export const TEMP_LIMITS = { min: 18, max: 26 }

export const ROOM_NAMES: Record<RoomId, string> = {
  living: 'Living Room',
  kitchen: 'Kitchen',
  corridor: 'Corridor',
  kids1: 'Kids Room 1',
  kids2: 'Kids Room 2',
  bedroom: "Parents' Bedroom",
}

/** Комнаты с окнами: в коридоре окна нет */
export const WINDOW_ROOMS: RoomId[] = ['living', 'kitchen', 'kids1', 'kids2', 'bedroom']
export const ROOM_ORDER: RoomId[] = ['living', 'kitchen', 'corridor', 'kids1', 'kids2', 'bedroom']
export const SHARED_ROOMS: RoomId[] = ['living', 'kitchen', 'corridor']

export const DEVICES: DeviceDef[] = [
  { key: 'living.light', room: 'living', label: 'Main light', short: 'Living Room light', icon: 'light', kind: 'dimmer' },
  { key: 'living.rgb', room: 'living', label: 'RGB lighting', short: 'RGB lighting', icon: 'rgb', kind: 'rgb' },
  { key: 'living.climate', room: 'living', label: 'Climate', short: 'Living Room climate', icon: 'temp', kind: 'climate' },
  { key: 'living.curtains', room: 'living', label: 'Curtains', short: 'Curtains', icon: 'curtains', kind: 'curtains' },
  { key: 'living.tv', room: 'living', label: 'TV', short: 'TV', icon: 'tv', kind: 'toggle' },
  { key: 'living.sound', room: 'living', label: 'Sound system', short: 'Sound system', icon: 'sound', kind: 'toggle' },
  { key: 'kitchen.light', room: 'kitchen', label: 'Main ceiling light', short: 'Kitchen light', icon: 'light', kind: 'toggle' },
  { key: 'kitchen.climate', room: 'kitchen', label: 'Climate', short: 'Kitchen climate', icon: 'temp', kind: 'climate' },
  { key: 'corridor.light', room: 'corridor', label: 'Entrance light', short: 'Entrance light', icon: 'light', kind: 'dimmer' },
]

export const DEVICE_BY_KEY = Object.fromEntries(DEVICES.map((d) => [d.key, d])) as Record<DeviceKey, DeviceDef>

export type DeviceValues = Record<DeviceKey, DeviceValue>

export interface SceneDef {
  id: SceneId
  name: string
  /** Короткое описание для страницы сцен */
  description: string
  icon: IconName
  values: DeviceValues
}

// Значения всех четырёх сцен взяты из макета.
export const SCENES: Record<SceneId, SceneDef> = {
  general: {
    id: 'general', name: 'General', description: 'Everyday light and comfort in the shared rooms.', icon: 'sun',
    values: {
      'living.light': 80, 'living.rgb': 'off', 'living.climate': 22, 'living.curtains': 'open', 'living.tv': false, 'living.sound': false,
      'kitchen.light': true, 'kitchen.climate': 22, 'corridor.light': 100,
    },
  },
  cinema: {
    id: 'cinema', name: 'Cinema', description: 'Dim light, closed curtains, TV and sound on.', icon: 'film',
    values: {
      'living.light': 0, 'living.rgb': 'low', 'living.climate': 21, 'living.curtains': 'closed', 'living.tv': true, 'living.sound': true,
      'kitchen.light': true, 'kitchen.climate': 22, 'corridor.light': 100,
    },
  },
  night: {
    id: 'night', name: 'Night', description: 'Lights and media off, curtains closed, a cooler room. The entrance light dims to a 10% night light.', icon: 'moon',
    values: {
      'living.light': 0, 'living.rgb': 'off', 'living.climate': 20, 'living.curtains': 'closed', 'living.tv': false, 'living.sound': false,
      'kitchen.light': false, 'kitchen.climate': 20, 'corridor.light': 10,
    },
  },
  guests: {
    id: 'guests', name: 'Guests', description: 'Bright light, open curtains, a little warmer.', icon: 'guests',
    values: {
      'living.light': 100, 'living.rgb': 'off', 'living.climate': 23, 'living.curtains': 'open', 'living.tv': false, 'living.sound': false,
      'kitchen.light': true, 'kitchen.climate': 23, 'corridor.light': 100,
    },
  },
}

export const SCENE_ORDER: SceneId[] = ['general', 'cinema', 'night', 'guests']

/** Что сцена делает: только устройства, которые в неё входят. У остальных значение остаётся как есть. */
export type SceneValues = Partial<DeviceValues>
export type SceneMap = Record<SceneId, SceneValues>

/** Устройства, которых нет в сцене по умолчанию (по макету) */
const NOT_IN_SCENE: Record<SceneId, DeviceKey[]> = {
  general: ['living.tv', 'living.sound'],
  cinema: ['kitchen.light', 'kitchen.climate', 'corridor.light'],
  night: [],
  guests: ['living.tv', 'living.sound'],
}

export const DEFAULT_SCENES: SceneMap = Object.fromEntries(
  (Object.keys(SCENES) as SceneId[]).map((id) => [
    id,
    Object.fromEntries(Object.entries(SCENES[id].values).filter(([k]) => !NOT_IN_SCENE[id].includes(k as DeviceKey))),
  ]),
) as SceneMap

/** Режим Away/Vacation: свет и медиа выключены, климат — энергосбережение */
export const AWAY_CLIMATE = 18
export function awayValues(current: DeviceValues): DeviceValues {
  return {
    ...current,
    'living.light': 0, 'living.rgb': 'off', 'living.climate': AWAY_CLIMATE, 'living.tv': false, 'living.sound': false,
    'kitchen.light': false, 'kitchen.climate': AWAY_CLIMATE, 'corridor.light': 0,
  }
}

/** Начальное состояние личных комнат (детские, спальня) */
export const INITIAL_PRIVATE: PrivateRooms = {
  kids1: { light: true, climate: 22, humidifier: true, curtains: 'open' },
  kids2: { light: false, climate: 21, humidifier: false, curtains: 'open' },
  bedroom: { light: false, climate: 22, humidifier: false, curtains: 'closed' },
}

/** В коридоре нет климата, но есть датчик температуры */
export const CORRIDOR_TEMP = 21

/** Устройства, которых нет на главном экране, но есть на странице комнаты (кухня) */
export const KITCHEN_EXTRAS: { key: ExtraKey; label: string; icon: IconName }[] = [
  { key: 'kitchen.bar', label: 'Bar lighting', icon: 'light' },
  { key: 'kitchen.floor', label: 'Floor heating', icon: 'temp' },
]
export const COUNTERTOP = { label: 'Countertop lighting', icon: 'light' as IconName, status: 'Off · wall switch only' }
export const INITIAL_EXTRAS: Record<ExtraKey, boolean> = { 'kitchen.bar': false, 'kitchen.floor': true }

/** Личные комнаты: панель только показывает их состояние, управляют телефоны семьи */
export const PRIVATE_DEVICES: Record<PrivateRoomId, { key: PrivateKey; label: string; icon: IconName }[]> = {
  kids1: [
    { key: 'light', label: 'Light', icon: 'light' },
    { key: 'climate', label: 'Climate', icon: 'temp' },
    { key: 'humidifier', label: 'Humidifier', icon: 'drop' },
  ],
  kids2: [
    { key: 'light', label: 'Light', icon: 'light' },
    { key: 'climate', label: 'Climate', icon: 'temp' },
    { key: 'humidifier', label: 'Humidifier', icon: 'drop' },
  ],
  bedroom: [
    { key: 'light', label: 'Light', icon: 'light' },
    { key: 'climate', label: 'Climate', icon: 'temp' },
    { key: 'humidifier', label: 'Humidifier', icon: 'drop' },
    { key: 'curtains', label: 'Curtains', icon: 'curtains' },
  ],
}
export const PRIVATE_ROOM_IDS: PrivateRoomId[] = ['kids1', 'kids2', 'bedroom']

export const MODE_NAMES: Record<Mode, string> = { home: 'Home', away: 'Away', vacation: 'Vacation' }
export const TODAY_ENERGY_KWH = 18.4
