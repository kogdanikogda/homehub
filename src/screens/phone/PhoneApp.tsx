import { useState } from 'react'
import { AlarmVeil } from '../../components/AlarmVeil/AlarmVeil'
import { CriticalAlert } from '../../components/CriticalAlert/CriticalAlert'
import type { ModeRowProps } from '../../components/ModeMenu/ModeMenu'
import { MODE_NAMES, ROOM_NAMES, SCENES } from '../../store/data'
import { HeaderCtx, type HeaderState, ModeSheet, PhoneBody, PhoneHeader, TabBar, type CamId, type TabDef } from '../../components/Phone/Phone'
import { ToastHost } from '../../components/ToastHost/ToastHost'
import type { DeviceId, Mode, RoomId, SceneId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { DialogHost } from '../tablet/DialogHost'
import { AddDevice } from './AddDevice'
import { Dashboard } from './Dashboard'
import { DevicesScreen } from './Devices'
import { EnergyScreen } from './EnergyScreen'
import { RoomScreen, RoomsList } from './Rooms'
import { SceneEdit } from './SceneEdit'
import { SceneScreen, ScenesList } from './Scenes'
import { CameraScreen, SecurityScreen } from './Security'
import { SettingsScreen } from './Settings'
import styles from './Phone.module.css'
import { t } from '../../i18n'

export type PhoneUser = Exclude<DeviceId, 'tablet'>
type Tab = 'dashboard' | 'rooms' | 'scenes' | 'security' | 'devices' | 'settings'
type Sub =
  | { kind: 'room'; id: RoomId }
  | { kind: 'scene'; id: SceneId }
  | { kind: 'sceneEdit'; id: SceneId }
  | { kind: 'camera'; id: CamId }
  | { kind: 'addDevice' }
  | { kind: 'energy' }
  | null

const familyTabs = (): TabDef<Tab>[] => [
  { id: 'dashboard', label: t('Dashboard'), icon: 'dash' },
  { id: 'rooms', label: t('Rooms'), icon: 'rooms' },
  { id: 'scenes', label: t('Scenes'), icon: 'scenes' },
]
const adminTabs = (): TabDef<Tab>[] => [
  ...familyTabs(),
  { id: 'security', label: t('Security'), icon: 'shield' },
  { id: 'devices', label: t('Devices'), icon: 'grid' },
  { id: 'settings', label: t('Settings'), icon: 'gear' },
]

const titles = (): Record<Tab, string> => ({ dashboard: t('Home'), rooms: t('Rooms'), scenes: t('Scenes'), security: t('Security'), devices: t('Devices'), settings: t('Settings') })
const role = (u: 'marina' | 'alexey') => (u === 'marina' ? t('Household · Marina') : t('Administrator · Alexey'))
const camNames = (): Record<CamId, string> => ({ yard: t('Yard'), entrance: t('Entrance'), garage: t('Garage'), living: t('Living room') })

/** Приложение на телефоне: у семьи три вкладки, у администратора шесть */
export function PhoneApp({ user = 'marina' }: { user?: PhoneUser }) {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [sub, setSub] = useState<Sub>(null)
  const toast = useHome((s) => s.toasts[user])
  const clearToast = useHome((s) => s.clearToast)
  const admin = user === 'alexey'
  const mode = useHome((s) => s.mode)
  const alarm = useHome((s) => s.alarm)
  const alert = useHome((s) => s.alert)
  const [sheet, setSheet] = useState(false)
  const [hdr, setHdr] = useState<HeaderState>(null)
  const act = useHome.getState()

  const pick = (m: Mode) => {
    setSheet(false)
    if (m === 'away' && mode === 'home') act.requestAway(user)
    if (m === 'home' && mode !== 'home') act.requestHome(user)
    if (m === 'vacation' && admin && mode !== 'vacation') act.enterVacation(user)
  }
  const rows: ModeRowProps[] = [
    { icon: 'home', name: MODE_NAMES.home, description: t('Alarm off. Everyday life at home.'), current: mode === 'home', onClick: () => pick('home') },
    { icon: 'lock', name: MODE_NAMES.away, description: t('Alarm on. Lights and media off. For when everyone leaves.'), current: mode === 'away', locked: mode === 'vacation', onClick: () => pick('away') },
    { icon: 'case', name: MODE_NAMES.vacation, description: admin ? t('Long absence. Only you can turn it on.') : t('Long absence. Turned on by Alexey.'), current: mode === 'vacation', locked: !admin, badge: admin ? undefined : t('Admin only'), onClick: () => pick('vacation') },
  ]

  const go = (next: Tab) => { setTab(next); setSub(null) }
  const title =
    sub?.kind === 'room' ? ROOM_NAMES[sub.id]
    : sub?.kind === 'scene' ? SCENES[sub.id].name
    : sub?.kind === 'sceneEdit' ? t('Edit {name}', { name: SCENES[sub.id].name })
    : sub?.kind === 'camera' ? camNames()[sub.id]
    : sub?.kind === 'addDevice' ? t('Add a device')
    : sub?.kind === 'energy' ? t('Energy')
    : titles()[tab]

  return (
    <HeaderCtx.Provider value={setHdr}>
    <div className={styles.root}>
      <PhoneHeader title={hdr?.title ?? title} back={hdr?.back} subtitle={role(user)} mode={mode} modeName={MODE_NAMES[mode]} alarm={alarm} onMode={() => setSheet(true)} showTitle={!(tab === 'dashboard' && !sub) || Boolean(hdr)} />
      <PhoneBody>
        {tab === 'dashboard' && !sub && (
          <Dashboard user={user} onRoom={(id) => { setTab('rooms'); setSub({ kind: 'room', id }) }} onEnergy={() => setSub({ kind: 'energy' })} />
        )}
        {sub?.kind === 'energy' && <EnergyScreen onBack={() => setSub(null)} />}
        {tab === 'rooms' && !sub && <RoomsList onRoom={(id) => setSub({ kind: 'room', id })} />}
        {sub?.kind === 'room' && <RoomScreen user={user} room={sub.id} onBack={() => setSub(null)} />}
        {tab === 'scenes' && !sub && <ScenesList onScene={(id) => setSub({ kind: 'scene', id })} />}
        {sub?.kind === 'scene' && <SceneScreen user={user} scene={sub.id} onBack={() => setSub(null)} onEdit={() => setSub({ kind: 'sceneEdit', id: sub.id })} />}
        {sub?.kind === 'sceneEdit' && <SceneEdit scene={sub.id} onBack={() => setSub({ kind: 'scene', id: sub.id })} />}
        {admin && tab === 'security' && !sub && <SecurityScreen onCamera={(id) => setSub({ kind: 'camera', id })} />}
        {sub?.kind === 'camera' && <CameraScreen id={sub.id} onBack={() => setSub(null)} onOther={(id) => setSub({ kind: 'camera', id })} />}
        {admin && tab === 'devices' && !sub && <DevicesScreen onAdd={() => setSub({ kind: 'addDevice' })} />}
        {sub?.kind === 'addDevice' && <AddDevice onClose={() => setSub(null)} />}
        {admin && tab === 'settings' && !sub && <SettingsScreen />}
      </PhoneBody>
      <TabBar tabs={admin ? adminTabs() : familyTabs()} value={tab} onChange={go} />
      {alarm && !alert && <AlarmVeil radius={38} />}
      {sheet && <ModeSheet rows={rows} onClose={() => setSheet(false)} />}
      <DialogHost by={user} compact />
      {alert && (alert.kind === 'intrusion'
        ? <CriticalAlert icon="shield" title={t('Alarm triggered')} subtitle={t('Intrusion detected · {at}', { at: alert.at })} note={t('The siren is on.')}
            actionLabel={t('Turn off alarm')} actionIcon="shield" onAction={() => act.confirmAlarmOff(user)} />
        : <CriticalAlert icon="fire" title={t('Smoke detected')} subtitle={t('Kitchen smoke sensor · {at}', { at: alert.at })} note={t('Alarm sound is on until you acknowledge.')}
            actionLabel={t('Acknowledge')} actionIcon="check" onAction={act.acknowledgeSmoke} />)}
      <ToastHost toast={toast} onDone={(id) => clearToast(id, user)} />
    </div>
    </HeaderCtx.Provider>
  )
}
