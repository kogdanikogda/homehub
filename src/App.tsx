import { useState } from 'react'
import { Button } from './components/Button/Button'
import { PhoneFrame } from './components/PhoneFrame/PhoneFrame'
import { TabletFrame } from './components/TabletFrame/TabletFrame'
import { ROOM_NAMES } from './store/data'
import { useHome } from './store/useHome'
import { PhoneApp } from './screens/phone/PhoneApp'
import { TabletApp } from './screens/tablet/TabletApp'
import styles from './App.module.css'

/** Панель, которой в прототипе вызывают события «из жизни дома» */
function PrototypePanel() {
  const windows = useHome((s) => s.windowsOpen)
  const failKeys = useHome((s) => s.failKeys)
  const mode = useHome((s) => s.mode)
  const decline = useHome((s) => s.declinePairing)
  const manual = useHome((s) => s.pairingManual)
  const flow = useHome((s) => s.addFlow)
  const a = useHome.getState()
  const tvFails = failKeys.includes('living.tv')
  return (
    <aside className={styles.panel} aria-label="Prototype controls">
      <span className={styles.label}>Prototype</span>
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
      <Button size="sm" variant="secondary" onClick={a.dim}>Dim screen</Button>
      <Button size="sm" variant="secondary" onClick={a.reset}>Reset</Button>
    </aside>
  )
}

type View = 'tablet' | 'marina' | 'alexey'

export function App() {
  // Пока без общей демо-страницы: одно устройство за раз, состояние дома общее
  const [view, setView] = useState<View>('tablet')
  return (
    <div className={styles.page}>
      <div className={styles.switch} role="group" aria-label="Device">
        <Button size="sm" variant={view === 'tablet' ? 'primary' : 'secondary'} onClick={() => setView('tablet')}>Wall tablet</Button>
        <Button size="sm" variant={view === 'marina' ? 'primary' : 'secondary'} onClick={() => setView('marina')}>Marina’s phone</Button>
        <Button size="sm" variant={view === 'alexey' ? 'primary' : 'secondary'} onClick={() => setView('alexey')}>Alexey’s phone</Button>
      </div>
      <div className={styles.stage}>
        {view === 'tablet'
          ? <TabletFrame><TabletApp /></TabletFrame>
          : <PhoneFrame label={view === 'marina' ? 'Marina’s phone' : 'Alexey’s phone'}><PhoneApp key={view} user={view} /></PhoneFrame>}
      </div>
      <PrototypePanel />
    </div>
  )
}
