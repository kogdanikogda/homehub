import type { DeviceDef, DeviceKey, DeviceValue, Mode, RoomId, SceneId } from './types'
import type { IconName } from '../components/Icon/Icon'

export const HOUSE_NAME = 'Home on Birch Street 12'
/** Прототипный PIN (показывается подсказкой на экране) */
export const PROTOTYPE_PIN = '1234'
/** Глобальный диапазон температур — настраивается только в админке */
export const TEMP_LIMITS = { min: 16, max: 26 }

export const ROOM_NAMES: Record<RoomId, string> = {
  living: 'Living Room',
  kitchen: 'Kitchen',
  corridor: 'Corridor',
  kids1: 'Kids Room 1',
  kids2: 'Kids Room 2',
  bedroom: "Parents' Bedroom",
}

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
  icon: IconName
  values: DeviceValues
}

// Значения General, Cinema и Night взяты из макета. Значения Guests в макете не заданы — это допущение прототипа.
export const SCENES: Record<SceneId, SceneDef> = {
  general: {
    id: 'general', name: 'General', icon: 'sun',
    values: {
      'living.light': 80, 'living.rgb': 'off', 'living.climate': 22, 'living.curtains': 'open', 'living.tv': false, 'living.sound': false,
      'kitchen.light': true, 'kitchen.climate': 22, 'corridor.light': 100,
    },
  },
  cinema: {
    id: 'cinema', name: 'Cinema', icon: 'film',
    values: {
      'living.light': 0, 'living.rgb': 'low', 'living.climate': 21, 'living.curtains': 'closed', 'living.tv': true, 'living.sound': true,
      'kitchen.light': true, 'kitchen.climate': 22, 'corridor.light': 100,
    },
  },
  night: {
    id: 'night', name: 'Night', icon: 'moon',
    values: {
      'living.light': 0, 'living.rgb': 'off', 'living.climate': 20, 'living.curtains': 'closed', 'living.tv': false, 'living.sound': false,
      'kitchen.light': false, 'kitchen.climate': 20, 'corridor.light': 10,
    },
  },
  guests: {
    id: 'guests', name: 'Guests', icon: 'guests',
    values: {
      'living.light': 100, 'living.rgb': 'low', 'living.climate': 22, 'living.curtains': 'open', 'living.tv': false, 'living.sound': false,
      'kitchen.light': true, 'kitchen.climate': 22, 'corridor.light': 100,
    },
  },
}

export const SCENE_ORDER: SceneId[] = ['general', 'cinema', 'night', 'guests']

/** Режим Away/Vacation: свет и медиа выключены, климат — энергосбережение */
export const AWAY_CLIMATE = 18
export function awayValues(current: DeviceValues): DeviceValues {
  return {
    ...current,
    'living.light': 0, 'living.rgb': 'off', 'living.climate': AWAY_CLIMATE, 'living.tv': false, 'living.sound': false,
    'kitchen.light': false, 'kitchen.climate': AWAY_CLIMATE, 'corridor.light': 0,
  }
}

/** Температура в комнатах без панели управления (детские, спальня) — для средней температуры дома */
export const PRIVATE_CLIMATE: Record<'kids1' | 'kids2' | 'bedroom', number> = { kids1: 22, kids2: 22, bedroom: 21 }

export const MODE_NAMES: Record<Mode, string> = { home: 'Home', away: 'Away', vacation: 'Vacation' }
export const TODAY_ENERGY_KWH = 18.4
