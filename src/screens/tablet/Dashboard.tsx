import { AlertStrip } from '../../components/AlertStrip/AlertStrip'
import { RoomLight } from '../../components/FullLightButton/RoomLight'
import { DeviceRow } from '../../components/DeviceRow/DeviceRow'
import { RoomCard } from '../../components/RoomCard/RoomCard'
import { SceneCard } from '../../components/SceneCard/SceneCard'
import { SceneTile } from '../../components/SceneTile/SceneTile'
import { DEVICES, MODE_NAMES, ROOM_NAMES, SCENES, SCENE_ORDER, SHARED_ROOMS } from '../../store/data'
import { modifiedChanges, windowAlertText } from '../../store/logic'
import { ROOM_ORDER } from '../../store/data'
import type { RoomId } from '../../store/types'
import { useIgnoredKeys } from '../../store/selectors'
import { useHome } from '../../store/useHome'
import { DeviceControl } from './DeviceControl'
import styles from './Tablet.module.css'

export function Dashboard({ onAllDevices }: { onAllDevices: (room: RoomId) => void }) {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const activeScene = useHome((s) => s.activeScene)
  const unresponsive = useHome((s) => s.unresponsive)
  const ignored = useIgnoredKeys()
  const scenes = useHome((s) => s.scenes)
  const windowsOpen = useHome((s) => s.windowsOpen)
  const tapScene = useHome((s) => s.tapScene)
  const openWindows = useHome((s) => s.openWindows)

  const changes = modifiedChanges(devices, activeScene, ignored, scenes)
  const changedKeys = new Set(changes.map((c) => c.key))
  const openRooms = ROOM_ORDER.filter((r) => windowsOpen[r])

  const hint =
    mode !== 'home'
      ? `Scenes are unavailable in ${MODE_NAMES[mode]} mode.`
      : changes.length
        ? `${SCENES[activeScene!].name} differs from its saved settings. Tap it to see what changed.`
        : 'A scene sets lights, climate, curtains and media in Living Room, Kitchen and Corridor.'

  return (
    <main className={styles.main}>
      {openRooms.length > 0 && <AlertStrip text={windowAlertText(openRooms)} onAction={() => openWindows()} />}
      <SceneCard hint={hint}>
        {SCENE_ORDER.map((id) => {
          const scene = SCENES[id]
          const state =
            mode !== 'home' ? 'unavailable' : id !== activeScene ? 'idle' : changes.length ? 'modified' : 'active'
          return (
            <SceneTile key={id} name={scene.name} icon={scene.icon} state={state}
              modifiedLabel={`Modified · ${changes.length} ${changes.length === 1 ? 'change' : 'changes'}`}
              onClick={() => tapScene(id)} />
          )
        })}
      </SceneCard>
      <div className={styles.rooms}>
        {SHARED_ROOMS.map((room) => (
          <RoomCard key={room} title={ROOM_NAMES[room]} windowOpen={windowsOpen[room]} lightAction={<RoomLight room={room} />} onAllDevices={() => onAllDevices(room)}>
            {DEVICES.filter((d) => d.room === room).map((d) => (
              <DeviceRow key={d.key} icon={d.icon} label={d.label} changed={changedKeys.has(d.key)}
                unavailable={unresponsive.includes(d.key)} status={unresponsive.includes(d.key) ? 'No response' : undefined}
                control={<DeviceControl def={d} />} />
            ))}
          </RoomCard>
        ))}
      </div>
    </main>
  )
}
