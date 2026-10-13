import { useState } from 'react'
import { PhoneBody, PhoneHeader, TabBar, type CamId, type TabDef } from '../../components/Phone/Phone'
import { ToastHost } from '../../components/ToastHost/ToastHost'
import type { DeviceId, RoomId, SceneId } from '../../store/types'
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

const FAMILY_TABS: TabDef<Tab>[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dash' },
  { id: 'rooms', label: 'Rooms', icon: 'rooms' },
  { id: 'scenes', label: 'Scenes', icon: 'scenes' },
]
const ADMIN_TABS: TabDef<Tab>[] = [
  ...FAMILY_TABS,
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'devices', label: 'Devices', icon: 'grid' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
]

const TITLES: Record<Tab, string> = { dashboard: '', rooms: 'Rooms', scenes: 'Scenes', security: 'Security', devices: 'Devices', settings: 'Settings' }
const CAM_NAMES: Record<CamId, string> = { yard: 'Yard', entrance: 'Entrance', garage: 'Garage', living: 'Living room' }

/** Приложение на телефоне: у семьи три вкладки, у администратора шесть */
export function PhoneApp({ user = 'marina' }: { user?: PhoneUser }) {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [sub, setSub] = useState<Sub>(null)
  const toast = useHome((s) => s.toasts[user])
  const clearToast = useHome((s) => s.clearToast)
  const mode = useHome((s) => s.mode)
  const admin = user === 'alexey'

  const go = (t: Tab) => { setTab(t); setSub(null) }
  const title =
    sub?.kind === 'room' ? 'Rooms'
    : sub?.kind === 'scene' || sub?.kind === 'sceneEdit' ? 'Scenes'
    : sub?.kind === 'camera' ? CAM_NAMES[sub.id]
    : sub?.kind === 'addDevice' ? 'Devices'
    : sub?.kind === 'energy' ? 'Energy'
    : TITLES[tab]

  return (
    <div className={styles.root}>
      <PhoneHeader mode={mode} title={tab === 'dashboard' && !sub ? undefined : title} />
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
      <TabBar tabs={admin ? ADMIN_TABS : FAMILY_TABS} value={tab} onChange={go} />
      <DialogHost by={user} compact />
      <ToastHost toast={toast} onDone={(id) => clearToast(id, user)} />
    </div>
  )
}
