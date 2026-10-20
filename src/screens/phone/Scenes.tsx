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
import { t } from '../../i18n'

export function ScenesList({ onScene }: { onScene: (id: SceneId) => void }) {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const activeScene = useHome((s) => s.activeScene)
  const ignored = useIgnoredKeys()
  const scenes = useHome((s) => s.scenes)
  const changes = modifiedChanges(devices, activeScene, ignored, scenes).length

  const status = (id: SceneId) => {
    if (mode !== 'home') return t('Unavailable in {mode} mode', { mode: MODE_NAMES[mode] })
    if (id !== activeScene) return t('Not active')
    return changes ? (changes === 1 ? t('Modified · 1 change') : t('Modified · {n} changes', { n: changes })) : t('Active')
  }

  return (
    <>
      <div className={styles.list}>
        {SCENE_ORDER.map((id) => (
          <SceneRow key={id} icon={SCENES[id].icon} name={SCENES[id].name} status={status(id)} warn={id === activeScene && changes > 0 && mode === 'home'} onClick={() => onScene(id)} />
        ))}
      </div>
      <Note>{t('Scenes control Living Room, Kitchen and Corridor. Private rooms are not changed by scenes.')}</Note>
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
      <ScreenHeader back={{ label: t('Scenes'), onClick: onBack }} title={t('{name} is modified', { name: SCENES[scene].name })} />
      <Note>{t('The scene is active and differs from its saved settings. Choose what to save to the scene.')}</Note>
      <div className={styles.diff}>
        {changes.map((c) => (
          <CheckRow key={c.key} checked={!off.includes(c.key)} onChange={(v) => setOff((o) => (v ? o.filter((k) => k !== c.key) : [...o, c.key]))}
            label={deviceTitle(c.key)} small={t('Saved {a} → Now {b}', { a: formatValue(c.key, c.to), b: formatValue(c.key, c.from) })} />
        ))}
      </div>
      <Button size="md" className={styles.btn} disabled={!picked.length} onClick={() => { useHome.getState().saveToScene(picked.map((c) => c.key)); onBack() }}>{t('Save {n} to scene', { n: picked.length })}</Button>
      <Button variant="secondary" size="md" className={styles.btn} onClick={onBack}>{t('Keep as temporary')}</Button>
      <Note>{t('Unsaved changes end when another scene is activated.')}</Note>
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
        <ScreenHeader back={{ label: t('Scenes'), onClick: onBack }} title={t('{name} is modified', { name: def.name })} />
        <div className={styles.diff}>
          {changes.map((c) => (
            <ChangeRow key={c.key} label={deviceTitle(c.key)} small={t('Saved {a} → Now {b}', { a: formatValue(c.key, c.to), b: formatValue(c.key, c.from) })} />
          ))}
        </div>
        <Button size="md" className={styles.btn} onClick={() => a.resetToScene(user)}>{t('Reset to scene')}</Button>
        {!admin && <Note>{t('Only Alexey can save changes to a scene. Until then they are temporary.')}</Note>}
      </>
    )
  }

  return (
    <>
      <ScreenHeader back={{ label: t('Scenes'), onClick: onBack }} title={def.name} />
      <Note>{def.description}</Note>
      <div className={styles.diff}>
        {DEVICES.filter((d) => isSceneControlled(d.key, scene, scenes)).map((d) => (
          <ChangeRow key={d.key} label={deviceTitle(d.key)} value={formatValue(d.key, scenes[scene][d.key] as DeviceValue)} />
        ))}
      </div>
      <Button size="md" className={styles.btn} disabled={mode !== 'home' || isActive} onClick={() => a.tapScene(scene, user)}>
        {isActive ? t('Active') : t('Activate {name}', { name: def.name })}
      </Button>
      {admin && <Button variant="secondary" size="md" className={styles.btn} onClick={onEdit}>{t('Edit scene')}</Button>}
      {mode !== 'home' && <Note>{t('Scenes are unavailable in {mode} mode.', { mode: MODE_NAMES[mode] })}</Note>}
      {!admin && mode === 'home' && <Note>{t('Only Alexey can edit scenes.')}</Note>}
    </>
  )
}
