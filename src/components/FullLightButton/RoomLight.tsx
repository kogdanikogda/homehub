import { useLightButton } from '../../store/selectors'
import type { DeviceId, RoomId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { FullLightButton } from './FullLightButton'

/** Кнопка света комнаты, подключённая к хранилищу. Если кнопка не нужна, ничего не рисует. */
export function RoomLight({ room, by = 'tablet', size, block }: { room: RoomId; by?: DeviceId; size?: 'lg' | 'md'; block?: boolean }) {
  const state = useLightButton(room)
  const fullLight = useHome((s) => s.fullLight)
  const restoreLight = useHome((s) => s.restoreLight)
  if (!state) return null
  return <FullLightButton state={state} size={size} block={block} onFull={() => fullLight(room, by)} onBack={() => restoreLight(room, by)} />
}
