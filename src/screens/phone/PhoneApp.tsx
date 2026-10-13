import { useState } from 'react'
import { PhoneBody, PhoneHeader, TabBar, type TabDef } from '../../components/Phone/Phone'
import { ToastHost } from '../../components/ToastHost/ToastHost'
import type { DeviceId, RoomId, SceneId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { DialogHost } from '../tablet/DialogHost'
import { Dashboard } from './Dashboard'
import { EnergyScreen } from './EnergyScreen'
import { RoomScreen, RoomsList } from './Rooms'
import { SceneScreen, ScenesList } from './Scenes'
import styles from './Phone.module.css'

export type PhoneUser = Exclude<DeviceId, 'tablet'>
type Tab = 'dashboard' | 'rooms' | 'scenes'
type Sub = { kind: 'room'; id: RoomId } | { kind: 'scene'; id: SceneId } | { kind: 'energy' } | null

const TABS: TabDef<Tab>[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dash' },
  { id: 'rooms', label: 'Rooms', icon: 'rooms' },
  { id: 'scenes', label: 'Scenes', icon: 'scenes' },
]

const TITLES = { dashboard: 'Home', rooms: 'Rooms', scenes: 'Scenes' } as const
const ROLE = { marina: 'Household · Marina', alexey: 'Administrator · Alexey' } as const

/** Приложение на телефоне. Пока собраны экраны семьи (Marina); экраны администратора добавляются отдельно. */
export function PhoneApp({ user = 'marina' }: { user?: PhoneUser }) {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [sub, setSub] = useState<Sub>(null)
  const toast = useHome((s) => s.toasts[user])
  const clearToast = useHome((s) => s.clearToast)

  const go = (t: Tab) => { setTab(t); setSub(null) }
  const title = sub?.kind === 'room' ? 'Rooms' : sub?.kind === 'scene' ? 'Scenes' : sub?.kind === 'energy' ? 'Energy' : TITLES[tab]

  return (
    <div className={styles.root}>
      <PhoneHeader title={title} subtitle={ROLE[user]} />
      <PhoneBody>
        {tab === 'dashboard' && !sub && (
          <Dashboard user={user} onRoom={(id) => { setTab('rooms'); setSub({ kind: 'room', id }) }} onEnergy={() => setSub({ kind: 'energy' })} />
        )}
        {sub?.kind === 'energy' && <EnergyScreen onBack={() => setSub(null)} />}
        {tab === 'rooms' && !sub && <RoomsList onRoom={(id) => setSub({ kind: 'room', id })} />}
        {sub?.kind === 'room' && <RoomScreen user={user} room={sub.id} onBack={() => setSub(null)} />}
        {tab === 'scenes' && !sub && <ScenesList onScene={(id) => setSub({ kind: 'scene', id })} />}
        {sub?.kind === 'scene' && <SceneScreen user={user} scene={sub.id} onBack={() => setSub(null)} />}
      </PhoneBody>
      <TabBar tabs={TABS} value={tab} onChange={go} />
      <DialogHost by={user} compact />
      <ToastHost toast={toast} onDone={(id) => clearToast(id, user)} />
    </div>
  )
}
