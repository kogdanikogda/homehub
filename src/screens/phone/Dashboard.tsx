import { PhoneCard, RoomRow, SceneChip, SectionLabel, StatTile, TechAlert, WarningRow } from '../../components/Phone/Phone'
import { useIgnoredKeys } from '../../store/selectors'
import { MODE_NAMES, ROOM_NAMES, ROOM_ORDER, SCENES, SCENE_ORDER, TODAY_ENERGY_KWH } from '../../store/data'
import { averageTemperature, deviceCount, devicesOnText, modifiedChanges, onCount, privateDeviceCount, privateOnCount, roomTemperature } from '../../store/logic'
import type { PrivateRoomId, RoomId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { PRIVATE_ROOM_IDS } from '../../store/data'
import type { PhoneUser } from './PhoneApp'
import { offlineText } from './TechAlertRow'
import { PairingRequest } from './PairingRequest'
import styles from './Phone.module.css'
import { t } from '../../i18n'

export const isPrivateRoom = (r: RoomId) => (PRIVATE_ROOM_IDS as RoomId[]).includes(r)

/** Сводка комнаты для списков: «22° · 2 on · Window open» (в списке температура справа, поэтому отдельно) */
export function useRoomSub() {
  const devices = useHome((s) => s.devices)
  const extras = useHome((s) => s.extras)
  const priv = useHome((s) => s.privateRooms)
  const windowsOpen = useHome((s) => s.windowsOpen)
  const mode = useHome((s) => s.mode)
  const added = useHome((s) => s.addedDevices)
  return (r: RoomId) => {
    const priv_ = isPrivateRoom(r)
    const on = priv_ ? privateOnCount(priv[r as keyof typeof priv], r as PrivateRoomId, added) : onCount(r, devices, extras, added)
    const total = priv_ ? privateDeviceCount(r as PrivateRoomId, added) : deviceCount(r, added)
    const text = `${devicesOnText(on, total)}${windowsOpen[r] ? ` · ${t('Window open')}` : ''}`
    const temp = mode !== 'home' && isPrivateRoom(r) ? 18 : roomTemperature(r, devices, priv)
    return { text, temp }
  }
}

export function Dashboard({ user, onRoom, onEnergy }: { user: PhoneUser; onRoom: (r: RoomId) => void; onEnergy: () => void }) {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const priv = useHome((s) => s.privateRooms)
  const activeScene = useHome((s) => s.activeScene)
  const windowsOpen = useHome((s) => s.windowsOpen)
  const unresponsive = useHome((s) => s.unresponsive)
  const offlineAt = useHome((s) => s.offlineAt)
  const pairing = useHome((s) => s.onboarding === 'pair')
  const scenes = useHome((s) => s.scenes)
  const ignored = useIgnoredKeys()
  const a = useHome.getState()
  const sub = useRoomSub()
  const open = ROOM_ORDER.filter((r) => windowsOpen[r])
  const admin = user === 'alexey'

  const modified = mode === 'home' && activeScene
    ? modifiedChanges(devices, activeScene, ignored, scenes).length > 0
    : false
  const sceneAside = mode !== 'home' ? t('Unavailable in {mode}', { mode: MODE_NAMES[mode] }) : !activeScene ? t('No scene active') : modified ? t('Modified') : null

  const tech = admin ? offlineText(unresponsive, offlineAt) : null

  return (
    <>
      {admin && pairing && <PairingRequest />}
      <div className={styles.group}>
        <PhoneCard title={t('Scene')} aside={sceneAside && <b style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{sceneAside}</b>}>
          <div className={styles.two}>
            {SCENE_ORDER.map((id) => (
              <SceneChip key={id} icon={SCENES[id].icon} name={SCENES[id].name} selected={id === activeScene} disabled={mode !== 'home'} onClick={() => { if (id !== activeScene) a.tapScene(id, user) }} />
            ))}
          </div>
        </PhoneCard>

        <div className={styles.stats}>
          <StatTile icon="temp" value={`${averageTemperature(devices, mode, priv).toFixed(1)}°`} caption={t('Average')} />
          <StatTile icon="window" value={open.length ? t('{n} open', { n: open.length }) : t('Closed')} caption={t('Windows')} attention={open.length > 0} onClick={() => a.openWindows(user)} />
          <StatTile icon="bolt" value={String(TODAY_ENERGY_KWH)} caption={t('kWh today')} onClick={onEnergy} />
        </div>
        {open.length > 0 && <WarningRow onClick={() => a.openWindows(user)}>{t('Open: {rooms}', { rooms: open.map((r) => ROOM_NAMES[r]).join(', ') })}</WarningRow>}
        {tech && <TechAlert>{tech}</TechAlert>}
      </div>

      <div className={styles.group}>
        <SectionLabel>{t('All rooms')}</SectionLabel>
        <div className={styles.list}>
          {ROOM_ORDER.map((r) => {
            const s = sub(r)
            return <RoomRow key={r} name={ROOM_NAMES[r]} sub={s.text} temp={s.temp} priv={isPrivateRoom(r)} onClick={() => onRoom(r)} />
          })}
        </div>
      </div>
    </>
  )
}
