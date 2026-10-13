import { useEffect, useState } from 'react'
import { CriticalAlert } from '../../components/CriticalAlert/CriticalAlert'
import { DimScreen } from '../../components/DimScreen/DimScreen'
import { Header } from '../../components/Header/Header'
import { ModeMenu, type ModeRowProps } from '../../components/ModeMenu/ModeMenu'
import { Rail, type Page } from '../../components/Rail/Rail'
import { ToastHost } from '../../components/ToastHost/ToastHost'
import { MODE_NAMES, TODAY_ENERGY_KWH } from '../../store/data'
import { averageTemperature, windowsText } from '../../store/logic'
import { ROOM_ORDER } from '../../store/data'
import type { Mode, RoomId, SceneId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { Dashboard } from './Dashboard'
import { DialogHost } from './DialogHost'
import { Onboarding } from './Onboarding'
import { RoomsPage } from './RoomsPage'
import { ScenesPage } from './ScenesPage'
import { useClock } from './useClock'
import styles from './Tablet.module.css'

const MODE_ICON = { home: 'home', away: 'lock', vacation: 'case' } as const

/** Публичная настенная панель */
export function TabletApp({ idleMs: idleOverride }: { idleMs?: number }) {
  const [page, setPage] = useState<Page>('dashboard')
  const [room, setRoom] = useState<RoomId>('living')
  const [sceneSel, setSceneSel] = useState<SceneId>('general')
  const [menuOpen, setMenuOpen] = useState(false)
  const clock = useClock()

  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const privateRooms = useHome((s) => s.privateRooms)
  const activeScene = useHome((s) => s.activeScene)
  const windowsOpen = useHome((s) => s.windowsOpen)
  const onboarding = useHome((s) => s.onboarding)
  const dimmed = useHome((s) => s.dimmed)
  const alert = useHome((s) => s.alert)
  const toast = useHome((s) => s.toasts.tablet)
  const idleMinutes = useHome((s) => s.idleMinutes)
  const act = useHome.getState()
  const idleMs = idleOverride ?? idleMinutes * 60_000

  const openRooms = ROOM_ORDER.filter((r) => windowsOpen[r])

  // Экран не блокируется: после бездействия он только приглушается, касание возвращает яркость
  const [touch, setTouch] = useState(0)
  useEffect(() => {
    if (dimmed || alert) return
    const t = setTimeout(() => useHome.getState().dim(), idleMs)
    return () => clearTimeout(t)
  }, [touch, dimmed, alert, idleMs])

  const pick = (m: Mode) => {
    setMenuOpen(false)
    if (m === 'away' && mode === 'home') act.requestAway()
    if (m === 'home' && mode !== 'home') act.requestHome()
  }
  const rows: ModeRowProps[] = [
    { icon: 'home', name: 'Home', description: 'Alarm off. Everyday life at home.', current: mode === 'home', badge: mode === 'home' ? undefined : 'PIN', onClick: () => pick('home') },
    { icon: 'lock', name: 'Away', description: 'Alarm on. Lights and media off. For when everyone leaves.', current: mode === 'away', locked: mode === 'vacation', onClick: () => pick('away') },
    { icon: 'case', name: 'Vacation', description: 'Long absence. Turned on by Alexey.', current: mode === 'vacation', locked: mode !== 'vacation', badge: 'Admin only', onClick: () => setMenuOpen(false) },
  ]

  const status = `${MODE_NAMES[mode]} mode · Alarm ${mode === 'home' ? 'off' : 'on'}${activeScene ? ` · Scene: ${activeScene[0].toUpperCase()}${activeScene.slice(1)}` : ''}`

  return (
    <div className={styles.root} onPointerDownCapture={() => setTouch((n) => n + 1)}>
      <Rail page={page} onPage={setPage} onDim={act.dim} />
      <div className={styles.col}>
        <Header
          time={clock.time}
          date={clock.date}
          stats={[
            { icon: 'temp', label: 'Average temperature', value: `${averageTemperature(devices, mode, privateRooms).toFixed(1)}°C` },
            { icon: 'window', label: 'Windows', value: windowsText(openRooms), attention: openRooms.length > 0 },
            { icon: 'bolt', label: 'Today’s energy', value: `${TODAY_ENERGY_KWH} kWh`, onClick: () => act.openEnergy() },
          ]}
          mode={{ icon: MODE_ICON[mode], name: MODE_NAMES[mode], armed: mode !== 'home', alarmOn: mode !== 'home' }}
          menuOpen={menuOpen}
          onMenuOpenChange={setMenuOpen}
          menu={<ModeMenu rows={rows} />}
        />
        {page === 'dashboard' && <Dashboard onAllDevices={(r) => { setRoom(r); setPage('rooms') }} />}
        {page === 'rooms' && <RoomsPage room={room} onRoom={setRoom} />}
        {page === 'scenes' && <ScenesPage scene={sceneSel} onScene={setSceneSel} />}
      </div>
      {onboarding && <Onboarding step={onboarding} />}
      <DialogHost />
      <ToastHost toast={toast} onDone={act.clearToast} />
      {alert && (alert.kind === 'intrusion'
        ? <CriticalAlert icon="shield" title="Alarm triggered" subtitle={`Intrusion detected · Entrance motion sensor · ${alert.at}`}
            note="The siren is on." actionLabel="Turn off alarm (PIN)" actionIcon="lock" onAction={() => act.requestAlarmOff()} />
        : <CriticalAlert icon="fire" title="Smoke detected" subtitle={`Kitchen smoke sensor · ${alert.at}`}
            note="Alarm sound is on until you acknowledge." actionLabel="Acknowledge" actionIcon="check" onAction={act.acknowledgeSmoke} />)}
      {dimmed && !alert && <DimScreen time={clock.time} status={status} onWake={act.wake} />}
    </div>
  )
}
