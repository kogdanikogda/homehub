import { useState } from 'react'
import { Button } from '../../components/Button/Button'
import { ScreenHeader, CheckRow, ChangeRow, Note, SceneRow } from '../../components/Phone/Phone'
import { DEVICES, MODE_NAMES, SCENES, SCENE_ORDER } from '../../store/data'
import { deviceTitle, formatValue, isSceneControlled, modifiedChanges } from '../../store/logic'
import type { DeviceValue, SceneId } from '../../store/types'
import { useIgnoredKeys } from '../../store/selectors'
import { useHome } from '../../store/useHome'
import type { PhoneUser } from './PhoneApp'
import styles from './Phone.module.css'

export function ScenesList({ onScene }: { onScene: (id: SceneId) => void }) {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const activeScene = useHome((s) => s.activeScene)
  const ignored = useIgnoredKeys()
  const scenes = useHome((s) => s.scenes)
  const changes = modifiedChanges(devices, activeScene, ignored, scenes).length

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

/** Админ: выбрать, какие правки сохранить в сцену */
function SaveToScene({ scene, onBack }: { scene: SceneId; onBack: () => void }) {
  const devices = useHome((s) => s.devices)
  const scenes = useHome((s) => s.scenes)
  const ignored = useIgnoredKeys()
  const changes = modifiedChanges(devices, scene, ignored, scenes)
  const [off, setOff] = useState<string[]>([])
  const picked = changes.filter((c) => !off.includes(c.key))
  return (
    <>
      <ScreenHeader back={{ label: 'Scenes', onClick: onBack }} title={`${SCENES[scene].name} is modified`} />
      <Note>The scene is active and differs from its saved settings. Choose what to save to the scene.</Note>
      <div className={styles.diff}>
        {changes.map((c) => (
          <CheckRow key={c.key} checked={!off.includes(c.key)} onChange={(v) => setOff((o) => (v ? o.filter((k) => k !== c.key) : [...o, c.key]))}
            label={deviceTitle(c.key)} small={`Saved ${formatValue(c.key, c.to)} → Now ${formatValue(c.key, c.from)}`} />
        ))}
      </div>
      <Button size="md" className={styles.btn} disabled={!picked.length} onClick={() => { useHome.getState().saveToScene(picked.map((c) => c.key)); onBack() }}>Save {picked.length} to scene</Button>
      <Button variant="secondary" size="md" className={styles.btn} onClick={onBack}>Keep as temporary</Button>
      <Note>Unsaved changes end when another scene is activated.</Note>
    </>
  )
}

export function SceneScreen({ user, scene, onBack, onEdit }: { user: PhoneUser; scene: SceneId; onBack: () => void; onEdit?: () => void }) {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const activeScene = useHome((s) => s.activeScene)
  const ignored = useIgnoredKeys()
  const scenes = useHome((s) => s.scenes)
  const a = useHome.getState()
  const def = SCENES[scene]
  const isActive = activeScene === scene && mode === 'home'
  const changes = isActive ? modifiedChanges(devices, scene, ignored, scenes) : []
  const admin = user === 'alexey'

  if (admin && changes.length) return <SaveToScene scene={scene} onBack={onBack} />

  // Сцена изменена вручную: показываем, чем текущее состояние отличается от сохранённого
  if (changes.length) {
    return (
      <>
        <ScreenHeader back={{ label: 'Scenes', onClick: onBack }} title={`${def.name} is modified`} />
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
      <ScreenHeader back={{ label: 'Scenes', onClick: onBack }} title={def.name} />
      <Note>{def.description}</Note>
      <div className={styles.diff}>
        {DEVICES.filter((d) => isSceneControlled(d.key, scene, scenes)).map((d) => (
          <ChangeRow key={d.key} label={deviceTitle(d.key)} value={formatValue(d.key, scenes[scene][d.key] as DeviceValue)} />
        ))}
      </div>
      <Button size="md" className={styles.btn} disabled={mode !== 'home' || isActive} onClick={() => a.tapScene(scene, user)}>
        {isActive ? 'Active' : `Activate ${def.name}`}
      </Button>
      {admin && <Button variant="secondary" size="md" className={styles.btn} onClick={onEdit}>Edit scene</Button>}
      {mode !== 'home' && <Note>Scenes are unavailable in {MODE_NAMES[mode]} mode.</Note>}
      {!admin && mode === 'home' && <Note>Only Alexey can edit scenes.</Note>}
    </>
  )
}
