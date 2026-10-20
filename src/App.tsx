import { useState } from 'react'
import { Button } from './components/Button/Button'
import { Icon } from './components/Icon/Icon'
import { PhoneFrame } from './components/PhoneFrame/PhoneFrame'
import { TabletFrame } from './components/TabletFrame/TabletFrame'
import { ROOM_NAMES } from './store/data'
import { useHome } from './store/useHome'
import { PhoneApp } from './screens/phone/PhoneApp'
import { TabletApp } from './screens/tablet/TabletApp'
import styles from './App.module.css'

/** Панель, которой в прототипе вызывают события «из жизни дома» */
type View = 'all' | 'tablet' | 'marina' | 'alexey'

function PrototypePanel({ view, pick }: { view: View; pick: (v: View) => void }) {
  const [open, setOpen] = useState(false)
  const windows = useHome((s) => s.windowsOpen)
  const failKeys = useHome((s) => s.failKeys)
  const mode = useHome((s) => s.mode)
  const decline = useHome((s) => s.declinePairing)
  const manual = useHome((s) => s.pairingManual)
  const freeze = useHome((s) => s.freezeProgress)
  const flow = useHome((s) => s.addFlow)
  const a = useHome.getState()
  const tvFails = failKeys.includes('living.tv')
  return (
    <>
    <button
      type="button"
      className={styles.gear}
      aria-label="Service panel"
      aria-expanded={open}
      aria-controls="service-panel"
      onClick={() => setOpen(!open)}
    >
      <Icon name="cog" size={24} />
    </button>
    {open && (
    <aside id="service-panel" className={styles.panel} aria-label="Service panel">
      <span className={styles.label}>Device</span>
      <div className={styles.devices} role="group" aria-label="Device">
        {(['tablet', 'marina', 'alexey', 'all'] as const).map((v) => (
          <Button key={v} size="sm" variant={view === v ? 'primary' : 'secondary'} aria-pressed={view === v} onClick={() => pick(v)}>
            {v === 'all' ? 'All 3 devices' : v === 'tablet' ? 'Wall tablet' : v === 'marina' ? 'Marina’s phone' : 'Alexey’s phone'}
          </Button>
        ))}
      </div>
      <span className={styles.label}>Events</span>
      <Button size="sm" variant="secondary" onClick={() => a.toggleWindow('living')}>
        {windows.living ? 'Close' : 'Open'} {ROOM_NAMES.living} window
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.toggleWindow('kids1')}>
        {windows.kids1 ? 'Close' : 'Open'} {ROOM_NAMES.kids1} window
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.triggerAlert('intrusion')}>Intrusion alarm</Button>
      <Button size="sm" variant="secondary" onClick={() => a.triggerAlert('smoke')}>Smoke in the kitchen</Button>
      <Button size="sm" variant="secondary" disabled={mode === 'vacation'} onClick={() => a.enterVacation()}>Vacation (from Alexey’s phone)</Button>
      <Button size="sm" variant="secondary" onClick={() => a.setFailKeys(tvFails ? [] : ['living.tv'])}>
        TV {tvFails ? 'will not respond' : 'responds'} to scenes
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.setOnboarding('welcome')}>Setup flow</Button>
      <Button size="sm" variant="secondary" onClick={() => a.setDeclinePairing(!decline)}>
        Owner {decline ? 'declines' : 'approves'} pairing
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.setPairingManual(!manual)}>
        Pairing: {manual ? 'decided on Alexey’s phone' : 'decided automatically'}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.setAddFlow({ searchEmpty: !flow.searchEmpty })}>
        Device search {flow.searchEmpty ? 'finds nothing' : 'finds devices'}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.setAddFlow({ connectFails: !flow.connectFails })}>
        Device setup {flow.connectFails ? 'fails' : 'succeeds'}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.setFreezeProgress(!freeze)}>
        Progress windows: {freeze ? 'freeze halfway (debug)' : 'run normally'}
      </Button>
      <Button size="sm" variant="secondary" onClick={a.dim}>Dim screen</Button>
      <Button size="sm" variant="secondary" onClick={a.reset}>Reset</Button>
    </aside>
    )}
    </>
  )
}

export function App() {
  // Стартовая страница — настенный планшет; остальные устройства выбираются в сервисной панели
  const [view, setView] = useState<View>(() => (new URLSearchParams(location.search).get('device') as View) || 'tablet')
  const pick = (v: View) => {
    setView(v)
    if (v === 'all') useHome.getState().setPairingManual(true)
  }
  return (
    <div className={styles.page}>
      {view === 'all' ? (
        <div className={styles.demo}>
          <figure className={styles.cell}><div className={styles.slot}><TabletFrame><TabletApp /></TabletFrame></div><figcaption>Wall tablet</figcaption></figure>
          <figure className={styles.cell}><div className={styles.slot}><PhoneFrame label="Marina’s phone"><PhoneApp user="marina" /></PhoneFrame></div><figcaption>Marina · household</figcaption></figure>
          <figure className={styles.cell}><div className={styles.slot}><PhoneFrame label="Alexey’s phone"><PhoneApp user="alexey" /></PhoneFrame></div><figcaption>Alexey · administrator</figcaption></figure>
        </div>
      ) : (
        <div className={styles.stage}>
          {view === 'tablet'
            ? <TabletFrame><TabletApp /></TabletFrame>
            : <PhoneFrame label={view === 'marina' ? 'Marina’s phone' : 'Alexey’s phone'}><PhoneApp key={view} user={view} /></PhoneFrame>}
        </div>
      )}
      <PrototypePanel view={view} pick={pick} />
    </div>
  )
}
