import { useEffect, useState } from 'react'
import { AlarmVeil } from '../../components/AlarmVeil/AlarmVeil'
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
import { t } from '../../i18n'

const MODE_ICON = { home: 'home', away: 'lock', vacation: 'case' } as const

/** Публичная настенная панель */
export function TabletApp({ idleMs: idleOverride }: { idleMs?: number }) {
  const [page, setPage] = useState<Page>('dashboard')
  const [room, setRoom] = useState<RoomId>('living')
  const [sceneSel, setSceneSel] = useState<SceneId>('general')
  const [menuOpen, setMenuOpen] = useState(false)
  const clock = useClock()

  const mode = useHome((s) => s.mode)
  const alarm = useHome((s) => s.alarm)
  const devices = useHome((s) => s.devices)
  const privateRooms = useHome((s) => s.privateRooms)
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
    const timer = setTimeout(() => useHome.getState().dim(), idleMs)
    return () => clearTimeout(timer)
  }, [touch, dimmed, alert, idleMs])

  const pick = (m: Mode) => {
    setMenuOpen(false)
    if (m === 'away' && mode === 'home') act.requestAway()
    if (m === 'home' && mode !== 'home') act.requestHome()
  }
  // Сигнализация не зависит от режима: выключается по PIN, включается без него
  const toggleAlarm = () => {
    setMenuOpen(false)
    if (alarm) act.requestAlarmOff()
    else act.armAlarm()
  }
  const rows: ModeRowProps[] = [
    { icon: 'home', name: MODE_NAMES.home, description: t('Alarm off. Everyday life at home.'), current: mode === 'home', badge: mode === 'home' ? undefined : t('PIN'), onClick: () => pick('home') },
    { icon: 'lock', name: MODE_NAMES.away, description: t('Alarm on. Lights and media off. For when everyone leaves.'), current: mode === 'away', locked: mode === 'vacation', onClick: () => pick('away') },
    { icon: 'case', name: MODE_NAMES.vacation, description: t('Long absence. Turned on by Alexey.'), current: mode === 'vacation', locked: mode !== 'vacation', badge: t('Admin only'), onClick: () => setMenuOpen(false) },
  ]


  // Дом под охраной (Away, Vacation): интерфейс перекрыт окном, нажимать можно только его кнопку
  const guarded = mode !== 'home'
  const modeAt = useHome((s) => s.modeAt)

  return (
    <div className={styles.root} onPointerDownCapture={() => setTouch((n) => n + 1)}>
      <div className={styles.guardWrap} inert={guarded || undefined}>
      <Rail page={page} onPage={setPage} onDim={act.dim} />
      <div className={styles.col}>
        <Header
          time={clock.time}
          date={clock.date}
          stats={[
            { icon: 'temp', label: t('Average temperature'), value: `${averageTemperature(devices, mode, privateRooms).toFixed(1)}°C` },
            { icon: 'window', label: t('Windows'), value: windowsText(openRooms), attention: openRooms.length > 0 },
            { icon: 'bolt', label: t('Today’s energy'), value: `${TODAY_ENERGY_KWH} ${t('kWh')}`, onClick: () => act.openEnergy() },
          ]}
          mode={{ icon: MODE_ICON[mode], name: MODE_NAMES[mode], armed: alarm, alarmOn: alarm }}
          menuOpen={menuOpen}
          onMenuOpenChange={setMenuOpen}
          menu={<ModeMenu rows={rows} alarm={{ on: alarm, badge: alarm ? t('PIN') : undefined, onClick: toggleAlarm }} />}
        />
        {page === 'dashboard' && <Dashboard onAllDevices={(r) => { setRoom(r); setPage('rooms') }} />}
        {page === 'rooms' && <RoomsPage room={room} onRoom={setRoom} />}
        {page === 'scenes' && <ScenesPage scene={sceneSel} onScene={setSceneSel} />}
      </div>
      </div>
      {alarm && !guarded && !alert && <AlarmVeil radius={24} />}
      {guarded && !alert && (
        <CriticalAlert tone="armed" icon={mode === 'vacation' ? 'case' : 'lock'} chip={t('Home is armed')}
          title={mode === 'vacation' ? t('Vacation mode') : t('Away mode')}
          where={mode === 'vacation' ? t('Long absence · Turned on by Alexey') : t('Alarm is on · Lights and media are off')}
          at={modeAt} sound={t('All sensors are watching')} soundIcon="motion"
          actionLabel={t('Switch to Home (PIN)')} actionIcon="home" onAction={() => act.requestHome()}/>
      )}
      {onboarding && <Onboarding step={onboarding} />}
      <DialogHost />
      <ToastHost toast={toast} onDone={act.clearToast} />
      {alert && (alert.kind === 'intrusion'
        ? <CriticalAlert tone="intrusion" icon="shield" title={t('Alarm triggered')} where={t('Entrance · motion sensor')} at={alert.at} since={alert.since}
            sound={t('Siren is on')} actionLabel={t('Turn off alarm (PIN)')} actionIcon="lock" onAction={() => act.requestAlarmOff()} />
        : <CriticalAlert tone="smoke" icon="fire" title={t('Smoke detected')} where={t('Kitchen · smoke sensor')} at={alert.at} since={alert.since}
            sound={t('Alarm sound is on')} actionLabel={t('Acknowledge')} actionIcon="check" onAction={act.acknowledgeSmoke} />)}
      {dimmed && !alert && <DimScreen time={clock.time} date={clock.date} temperature={`${averageTemperature(devices, mode, privateRooms).toFixed(1)}°C`} onWake={act.wake} />}
    </div>
  )
}
