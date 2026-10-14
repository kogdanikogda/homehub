import { useMemo } from 'react'
import { heldKeys, lightButton } from './logic'
import type { DeviceKey, RoomId } from './types'
import { useHome } from './useHome'

/** Устройства, которые не считаются «правкой сцены»: не ответили при активации или держатся кнопкой «Full light» */
export function useIgnoredKeys(): DeviceKey[] {
  const unresponsive = useHome((s) => s.unresponsive)
  const hold = useHome((s) => s.lightHold)
  return useMemo(() => [...unresponsive, ...heldKeys(hold)], [unresponsive, hold])
}

/** Состояние кнопки света для комнаты: «Full light», «Back to previous light» или без кнопки */
export function useLightButton(room: RoomId): 'full' | 'back' | null {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const privateRooms = useHome((s) => s.privateRooms)
  const unresponsive = useHome((s) => s.unresponsive)
  const hold = useHome((s) => s.lightHold)
  return lightButton(room, mode, devices, privateRooms, unresponsive, hold)
}
