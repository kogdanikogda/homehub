import { Chip } from '../../components/Chip/Chip'
import { DeviceRow } from '../../components/DeviceRow/DeviceRow'
import { Icon } from '../../components/Icon/Icon'
import { Switch } from '../../components/Switch/Switch'
import {
  AWAY_CLIMATE, COUNTERTOP, DEVICES, KITCHEN_EXTRAS, MODE_NAMES, PRIVATE_DEVICES, PRIVATE_ROOM_IDS,
  ROOM_NAMES, SCENES, SHARED_ROOMS,
} from '../../store/data'
import { formatPrivate, isSceneControlled, modifiedChanges, onCount, privateOnCount, roomSummary, roomTemperature, sceneControlledCount } from '../../store/logic'
import type { PrivateRoomId, RoomId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { DeviceControl } from './DeviceControl'
import styles from './RoomsPage.module.css'

const isPrivate = (r: RoomId): r is PrivateRoomId => PRIVATE_ROOM_IDS.includes(r as PrivateRoomId)

/** Страница «Комнаты»: список слева, карточка выбранной комнаты справа */
export function RoomsPage({ room, onRoom }: { room: RoomId; onRoom: (r: RoomId) => void }) {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const extras = useHome((s) => s.extras)
  const privateRooms = useHome((s) => s.privateRooms)
  const windowsOpen = useHome((s) => s.windowsOpen)

  const awayTemp = (r: RoomId) => (mode === 'home' ? roomTemperature(r, devices, privateRooms) : isPrivate(r) ? AWAY_CLIMATE : roomTemperature(r, devices, privateRooms))
  const item = (r: RoomId) => {
    const priv = isPrivate(r)
    const on = priv ? privateOnCount(privateRooms[r]) : onCount(r, devices, extras)
    return (
      <li key={r}>
        <button type="button" className={`${styles.item} ${r === room ? styles.sel : ''}`} aria-current={r === room ? 'true' : undefined} onClick={() => onRoom(r)}>
          <span className={styles.itemName}>
            {priv && <Icon name="lock" size={14} className={styles.lockIcon} />}
            {ROOM_NAMES[r]}
          </span>
          <span className={styles.itemSub}>{roomSummary(awayTemp(r), on)}</span>
          {windowsOpen[r] && <span className={styles.itemChip}><Chip tone="warning" icon="window" size="sm">Window open</Chip></span>}
        </button>
      </li>
    )
  }

  return (
    <main className={styles.split}>
      <nav className={styles.list} aria-label="Rooms">
        <h2 className={styles.colh}>Shared rooms</h2>
        <ul className={styles.ul}>{SHARED_ROOMS.map(item)}</ul>
        <h2 className={styles.colh}>Private rooms · view only</h2>
        <ul className={styles.ul}>{PRIVATE_ROOM_IDS.map(item)}</ul>
      </nav>
      <RoomDetail room={room} />
    </main>
  )
}

function RoomDetail({ room }: { room: RoomId }) {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const activeScene = useHome((s) => s.activeScene)
  const unresponsive = useHome((s) => s.unresponsive)
  const windowsOpen = useHome((s) => s.windowsOpen)
  const extras = useHome((s) => s.extras)
  const toggleExtra = useHome((s) => s.toggleExtra)
  const privateRooms = useHome((s) => s.privateRooms)

  const priv = isPrivate(room)
  const open = windowsOpen[room]
  const changedKeys = new Set(modifiedChanges(devices, activeScene, unresponsive).map((c) => c.key))
  const climateKey = room === 'living' || room === 'kitchen' ? (`${room}.climate` as const) : null
  const subtitle = priv
    ? `Climate set to ${mode === 'home' ? privateRooms[room].climate : AWAY_CLIMATE}°`
    : climateKey ? `Climate set to ${devices[climateKey]}°` : 'No climate control in this room'

  const scene = mode === 'home' && activeScene && !priv ? SCENES[activeScene] : null
  const count = scene ? sceneControlledCount(room, scene.id) : 0
  const own = DEVICES.filter((d) => d.room === room)

  return (
    <section className={styles.detail} aria-label={ROOM_NAMES[room]}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.h2}>{ROOM_NAMES[room]}</h2>
          <p className={styles.num}>{subtitle}</p>
        </div>
        <div className={styles.tags}>
          {open ? <Chip tone="warning" icon="window" size="sm">Window open</Chip> : <Chip tone="success" icon="check" size="sm">Windows closed</Chip>}
          {priv && <Chip tone="neutral" icon="lock" size="sm">View only</Chip>}
        </div>
      </header>

      {scene && (
        <div className={styles.legend}>
          <Icon name={scene.icon} size={16} className={styles.legendIcon} />
          <span>
            {scene.name} controls {count} {count === 1 ? 'device' : 'devices'}. Marked devices belong to the active “{scene.name}” scene.
            Changing them modifies the scene until another scene is activated.
          </span>
        </div>
      )}
      {mode !== 'home' && !priv && (
        <p className={styles.desc}>{MODE_NAMES[mode]} mode is on. Media is off and climate saves energy until Home mode returns.</p>
      )}

      <div className={styles.grid}>
        {priv
          ? PRIVATE_DEVICES[room].map((d) => (
              <DeviceRow key={d.key} icon={d.icon} label={d.label} control={<span className={styles.readonly}>{mode !== 'home' && d.key === 'climate' ? `${AWAY_CLIMATE}°` : formatPrivate(d.key, privateRooms[room])}</span>} />
            ))
          : (
            <>
              {own.map((d) => {
                const bad = unresponsive.includes(d.key)
                return (
                  <DeviceRow key={d.key} icon={d.icon} label={d.label}
                    inScene={Boolean(scene) && isSceneControlled(d.key, scene!.id)}
                    changed={changedKeys.has(d.key)} unavailable={bad}
                    control={bad ? <Chip tone="neutral" size="lg">Unavailable</Chip> : <DeviceControl def={d} />} />
                )
              })}
              {room === 'kitchen' && (
                <>
                  <DeviceRow icon={COUNTERTOP.icon} label={COUNTERTOP.label} control={<span className={styles.readonlyDim}>{COUNTERTOP.status}</span>} />
                  {KITCHEN_EXTRAS.map((e) => (
                    <DeviceRow key={e.key} icon={e.icon} label={e.label}
                      control={<Switch showState aria-label={e.label} checked={extras[e.key]} onCheckedChange={(v) => toggleExtra(e.key, v)} />} />
                  ))}
                </>
              )}
            </>
          )}
      </div>

      {priv && (
        <div className={styles.infobox}>
          <Icon name="lock" size={20} className={styles.legendIcon} />
          <span>This is a private room. You can see its state here. Family phones control it.</span>
        </div>
      )}
    </section>
  )
}
