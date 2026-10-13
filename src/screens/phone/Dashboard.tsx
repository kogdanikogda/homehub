import { AlarmPill, PhoneCard, RoomRow, SceneChip, SectionLabel, StatTile, TechAlert, WarningRow } from '../../components/Phone/Phone'
import { Segmented } from '../../components/Segmented/Segmented'
import { MODE_NAMES, ROOM_NAMES, ROOM_ORDER, SCENES, SCENE_ORDER, TODAY_ENERGY_KWH } from '../../store/data'
import { averageTemperature, onCount, privateOnCount, roomTemperature } from '../../store/logic'
import type { Mode, RoomId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { PRIVATE_ROOM_IDS } from '../../store/data'
import type { PhoneUser } from './PhoneApp'
import { offlineText } from './TechAlertRow'
import { PairingRequest } from './PairingRequest'
import styles from './Phone.module.css'

export const isPrivateRoom = (r: RoomId) => (PRIVATE_ROOM_IDS as RoomId[]).includes(r)

/** Сводка комнаты для списков: «22° · 2 on · Window open» (в списке температура справа, поэтому отдельно) */
export function useRoomSub() {
  const devices = useHome((s) => s.devices)
  const extras = useHome((s) => s.extras)
  const priv = useHome((s) => s.privateRooms)
  const windowsOpen = useHome((s) => s.windowsOpen)
  const mode = useHome((s) => s.mode)
  return (r: RoomId) => {
    const on = isPrivateRoom(r) ? privateOnCount(priv[r as keyof typeof priv]) : onCount(r, devices, extras)
    const text = `${on === 0 ? 'All off' : `${on} on`}${windowsOpen[r] ? ' · Window open' : ''}`
    const temp = mode !== 'home' && isPrivateRoom(r) ? 18 : roomTemperature(r, devices, priv)
    return { text, temp }
  }
}

const MODE_NOTE: Record<Mode, string> = {
  home: 'Alarm off. Normal household operation. Vacation is set by Alexey.',
  away: 'Alarm on. Lights and media are off. Return with Home when you are back.',
  vacation: 'Alarm on. Long absence. Only Alexey can end Vacation.',
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
  const a = useHome.getState()
  const sub = useRoomSub()
  const open = ROOM_ORDER.filter((r) => windowsOpen[r])
  const admin = user === 'alexey'

  const pickMode = (m: string) => {
    if (m === 'away' && mode === 'home') a.requestAway(user)
    if (m === 'home' && mode !== 'home') a.requestHome(user)
    if (m === 'vacation' && admin && mode !== 'vacation') a.enterVacation(user)
  }

  const tech = admin ? offlineText(unresponsive, offlineAt) : null

  return (
    <>
      {admin && pairing && <PairingRequest />}
      <div className={styles.group}>
        <PhoneCard title="House mode" aside={<AlarmPill on={mode !== 'home'} />}>
          <Segmented platform="phoneWide" label="House mode" value={mode} onChange={pickMode}
            items={[
              { value: 'home', label: MODE_NAMES.home, icon: 'home' },
              { value: 'away', label: MODE_NAMES.away, icon: 'lock', disabled: mode === 'vacation' },
              { value: 'vacation', label: MODE_NAMES.vacation, icon: 'case', disabled: !admin },
            ]} />
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: '17.5px', color: 'var(--text-secondary)' }}>{admin && mode === 'home' ? 'Alarm off. Normal household operation.' : MODE_NOTE[mode]}</p>
        </PhoneCard>

        <PhoneCard title="Scene" aside={<b style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{activeScene ? SCENES[activeScene].name : '—'}</b>}>
          <div className={styles.two}>
            {SCENE_ORDER.map((id) => (
              <SceneChip key={id} icon={SCENES[id].icon} name={SCENES[id].name} selected={id === activeScene} disabled={mode !== 'home'} onClick={() => a.tapScene(id, user)} />
            ))}
          </div>
        </PhoneCard>

        <div className={styles.stats}>
          <StatTile icon="temp" value={`${averageTemperature(devices, mode, priv).toFixed(1)}°`} caption="Average" />
          <StatTile icon="window" value={open.length ? `${open.length} open` : 'Closed'} caption="Windows" attention={open.length > 0} />
          <StatTile icon="bolt" value={String(TODAY_ENERGY_KWH)} caption="kWh today" onClick={onEnergy} />
        </div>
        {open.length > 0 && <WarningRow>Open: {open.map((r) => ROOM_NAMES[r]).join(', ')}</WarningRow>}
        {tech && <TechAlert>{tech}</TechAlert>}
      </div>

      <div className={styles.group}>
        <SectionLabel>All rooms</SectionLabel>
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
