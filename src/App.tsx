import { Button } from './components/Button/Button'
import { TabletFrame } from './components/TabletFrame/TabletFrame'
import { ROOM_NAMES } from './store/data'
import { useHome } from './store/useHome'
import { TabletApp } from './screens/tablet/TabletApp'
import styles from './App.module.css'

/** Панель, которой в прототипе вызывают события «из жизни дома» */
function PrototypePanel() {
  const windows = useHome((s) => s.windowsOpen)
  const failKeys = useHome((s) => s.failKeys)
  const mode = useHome((s) => s.mode)
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
      <Button size="sm" variant="secondary" disabled={mode === 'vacation'} onClick={a.enterVacation}>Vacation (from Alexey’s phone)</Button>
      <Button size="sm" variant="secondary" onClick={() => a.setFailKeys(tvFails ? [] : ['living.tv'])}>
        TV {tvFails ? 'will not respond' : 'responds'} to scenes
      </Button>
      <Button size="sm" variant="secondary" onClick={a.dim}>Dim screen</Button>
      <Button size="sm" variant="secondary" onClick={a.reset}>Reset</Button>
    </aside>
  )
}

export function App() {
  return (
    <div className={styles.page}>
      <div className={styles.stage}>
        <TabletFrame>
          <TabletApp />
        </TabletFrame>
      </div>
      <PrototypePanel />
    </div>
  )
}
