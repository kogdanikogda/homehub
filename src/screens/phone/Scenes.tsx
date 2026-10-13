import { Button } from '../../components/Button/Button'
import { BackLink, ChangeRow, Note, SceneRow } from '../../components/Phone/Phone'
import { DEVICES, MODE_NAMES, SCENES, SCENE_ORDER } from '../../store/data'
import { deviceTitle, formatValue, isSceneControlled, modifiedChanges } from '../../store/logic'
import type { SceneId } from '../../store/types'
import { useHome } from '../../store/useHome'
import type { PhoneUser } from './PhoneApp'
import styles from './Phone.module.css'

export function ScenesList({ onScene }: { onScene: (id: SceneId) => void }) {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const activeScene = useHome((s) => s.activeScene)
  const unresponsive = useHome((s) => s.unresponsive)
  const changes = modifiedChanges(devices, activeScene, unresponsive).length

  const status = (id: SceneId) => {
    if (mode !== 'home') return `Unavailable in ${MODE_NAMES[mode]} mode`
    if (id !== activeScene) return 'Not active'
    return changes ? `Modified · ${changes} ${changes === 1 ? 'change' : 'changes'}` : 'Active'
  }

  return (
    <>
      <div className={styles.list}>
        {SCENE_ORDER.map((id) => (
          <SceneRow key={id} icon={SCENES[id].icon} name={SCENES[id].name} status={status(id)} warn={id === activeScene && changes > 0 && mode === 'home'} onClick={() => onScene(id)} />
        ))}
      </div>
      <Note>Scenes control Living Room, Kitchen and Corridor. Private rooms are not changed by scenes.</Note>
    </>
  )
}

export function SceneScreen({ user, scene, onBack }: { user: PhoneUser; scene: SceneId; onBack: () => void }) {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const activeScene = useHome((s) => s.activeScene)
  const unresponsive = useHome((s) => s.unresponsive)
  const a = useHome.getState()
  const def = SCENES[scene]
  const isActive = activeScene === scene && mode === 'home'
  const changes = isActive ? modifiedChanges(devices, scene, unresponsive) : []
  const admin = user === 'alexey'

  // Сцена изменена вручную: показываем, чем текущее состояние отличается от сохранённого
  if (changes.length) {
    return (
      <>
        <BackLink label="Scenes" onClick={onBack} />
        <h2 className={styles.h2}>{def.name} is modified</h2>
        <div className={styles.diff}>
          {changes.map((c) => (
            <ChangeRow key={c.key} label={deviceTitle(c.key)} small={`Saved ${formatValue(c.key, c.to)} → Now ${formatValue(c.key, c.from)}`} />
          ))}
        </div>
        <Button size="md" className={styles.btn} onClick={() => a.resetToScene(user)}>Reset to scene</Button>
        {!admin && <Note>Only Alexey can save changes to a scene. Until then they are temporary.</Note>}
      </>
    )
  }

  return (
    <>
      <BackLink label="Scenes" onClick={onBack} />
      <h2 className={styles.h2}>{def.name}</h2>
      <Note>{def.description}</Note>
      <div className={styles.diff}>
        {DEVICES.filter((d) => isSceneControlled(d.key, scene)).map((d) => (
          <ChangeRow key={d.key} label={deviceTitle(d.key)} value={formatValue(d.key, def.values[d.key])} />
        ))}
      </div>
      <Button size="md" className={styles.btn} disabled={mode !== 'home' || isActive} onClick={() => a.tapScene(scene, user)}>
        {isActive ? 'Active' : `Activate ${def.name}`}
      </Button>
      {mode !== 'home' && <Note>Scenes are unavailable in {MODE_NAMES[mode]} mode.</Note>}
      {!admin && mode === 'home' && <Note>Only Alexey can edit scenes.</Note>}
    </>
  )
}
