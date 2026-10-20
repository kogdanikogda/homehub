import { useMemo } from 'react'
import { DeviceRow } from '../../components/DeviceRow/DeviceRow'
import { Chip } from '../../components/Chip/Chip'
import { Icon } from '../../components/Icon/Icon'
import { Note, ScreenHeader, RoomRow, WarningRow, PrivateChip } from '../../components/Phone/Phone'
import { Segmented } from '../../components/Segmented/Segmented'
import { Stepper } from '../../components/Stepper/Stepper'
import { Switch } from '../../components/Switch/Switch'
import {
  COUNTERTOP, DEVICES, KITCHEN_EXTRAS, MODE_NAMES, PRIVATE_DEVICES, ROOM_NAMES, ROOM_ORDER, SCENES,
} from '../../store/data'
import { isSceneControlled, modifiedChanges, sceneControlledCount as sceneCount } from '../../store/logic'
import type { PrivateRoomId, RoomId } from '../../store/types'
import { useIgnoredKeys } from '../../store/selectors'
import { useHome } from '../../store/useHome'
import { RoomLight } from '../../components/FullLightButton/RoomLight'
import { DeviceControl } from '../tablet/DeviceControl'
import type { PhoneUser } from './PhoneApp'
import { isPrivateRoom, useRoomSub } from './Dashboard'
import styles from './Phone.module.css'
import { t } from '../../i18n'

export function RoomsList({ onRoom }: { onRoom: (r: RoomId) => void }) {
  const sub = useRoomSub()
  return (
    <>
      <Note>{t('Tap a room to control it. Private rooms are only controlled from family phones.')}</Note>
      <div className={styles.list}>
        {ROOM_ORDER.map((r) => {
          const s = sub(r)
          return <RoomRow key={r} name={ROOM_NAMES[r]} sub={s.text} temp={s.temp} priv={isPrivateRoom(r)} onClick={() => onRoom(r)} />
        })}
      </div>
    </>
  )
}

export function RoomScreen({ user, room, onBack }: { user: PhoneUser; room: RoomId; onBack: () => void }) {
  const sub = useRoomSub()
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const activeScene = useHome((s) => s.activeScene)
  const unresponsive = useHome((s) => s.unresponsive)
  const ignored = useIgnoredKeys()
  const scenes = useHome((s) => s.scenes)
  const windowsOpen = useHome((s) => s.windowsOpen)
  const extras = useHome((s) => s.extras)
  const priv = useHome((s) => s.privateRooms)
  const toggleExtra = useHome((s) => s.toggleExtra)
  const setPrivate = useHome((s) => s.setPrivate)
  const addedAll = useHome((s) => s.addedDevices)
  const added = useMemo(() => addedAll.filter((d) => d.room === room), [addedAll, room])
  const toggleAdded = useHome((s) => s.toggleAdded)
  const limits = useHome((s) => s.tempLimits)

  const isPriv = isPrivateRoom(room)
  const s = sub(room)
  const scene = mode === 'home' && activeScene && !isPriv ? SCENES[activeScene] : null
  const changed = new Set(modifiedChanges(devices, activeScene, ignored, scenes).map((c) => c.key))
  const own = DEVICES.filter((d) => d.room === room)

  return (
    <>
      <ScreenHeader back={{ label: t('All rooms'), onClick: onBack }} title={ROOM_NAMES[room]} />
      <div className={styles.roomHead}>
        <p>{s.temp}° · {s.text}</p>
        {isPriv && <PrivateChip />}
      </div>
      {windowsOpen[room] && <WarningRow>{t('The window is open.')}</WarningRow>}
      {user === 'alexey' && scene && sceneCount(room, scene.id, scenes) > 0 && (
        <p className={styles.sceneNote}><Icon name="film" size={14} />{t('Part of the active “{name}” scene. Changes here mark the scene as modified.', { name: scene.name })}</p>
      )}
      {mode !== 'home' && !isPriv && <Note>{t('{mode} mode is on. Media is off and climate saves energy until Home mode returns.', { mode: MODE_NAMES[mode] })}</Note>}

      <div className={styles.devices}>
        {isPriv
          ? PRIVATE_DEVICES[room as PrivateRoomId].map((d) => {
              const st = priv[room as PrivateRoomId]
              const set = <K extends keyof typeof st>(k: K, v: (typeof st)[K]) => setPrivate(room as PrivateRoomId, k, v, user)
              const control =
                d.key === 'climate'
                  ? <Stepper label={t('Climate')} size="sm" value={st.climate} min={limits.min} max={limits.max} step={1} format={(v) => `${v}°`} onChange={(v) => set('climate', v)} />
                  : d.key === 'curtains'
                    ? <Segmented platform="phone" label={t('Curtains')} value={st.curtains} onChange={(v) => set('curtains', v as 'open' | 'closed')} items={[{ value: 'open', label: t('Open') }, { value: 'closed', label: t('Closed') }]} />
                    : <Switch size="sm" aria-label={d.label} checked={st[d.key]} onCheckedChange={(v) => set(d.key, v)} />
              return <DeviceRow key={d.key} platform="phone" icon={d.icon} label={d.label} control={control} />
            })
          : (
            <>
              {own.map((d) => {
                const bad = unresponsive.includes(d.key)
                return (
                  <DeviceRow key={d.key} platform="phone" icon={d.icon} label={d.label}
                    inScene={Boolean(scene) && isSceneControlled(d.key, scene!.id, scenes)}
                    changed={changed.has(d.key)} unavailable={bad}
                    control={bad ? <Chip tone="neutral" size="sm">{user === 'alexey' ? t('Offline') : t('Unavailable')}</Chip> : <DeviceControl def={d} platform="phone" by={user} />} />
                )
              })}
              {room === 'kitchen' && (
                <>
                  <DeviceRow platform="phone" icon={COUNTERTOP.icon} label={COUNTERTOP.label} status={COUNTERTOP.status} />
                  {KITCHEN_EXTRAS.map((e) => (
                    <DeviceRow key={e.key} platform="phone" icon={e.icon} label={e.label}
                      control={<Switch size="sm" aria-label={e.label} checked={extras[e.key]} onCheckedChange={(v) => toggleExtra(e.key, v)} />} />
                  ))}
                </>
              )}
            </>
          )}
        {added.map((d) => (
          <DeviceRow key={`add-${d.id}`} platform="phone" icon="light" label={d.name}
            control={<Switch size="sm" aria-label={d.name} checked={d.on} onCheckedChange={(v) => toggleAdded(d.id, v, user)} />} />
        ))}
      </div>
      <RoomLight room={room} by={user} size="md" />
    </>
  )
}
