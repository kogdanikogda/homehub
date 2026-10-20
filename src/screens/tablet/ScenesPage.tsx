import { Banner } from '../../components/Banner/Banner'
import { Button } from '../../components/Button/Button'
import { Icon } from '../../components/Icon/Icon'
import { ListRow } from '../../components/ListRow/ListRow'
import { DEVICES, MODE_NAMES, ROOM_NAMES, SCENES, SCENE_ORDER, SHARED_ROOMS } from '../../store/data'
import { formatValue, isSceneControlled, modifiedChanges } from '../../store/logic'
import type { DeviceValue, SceneId } from '../../store/types'
import { useIgnoredKeys } from '../../store/selectors'
import { useHome } from '../../store/useHome'
import styles from './ScenesPage.module.css'
import { t } from '../../i18n'

/** Страница «Сцены»: список слева, состав выбранной сцены справа */
export function ScenesPage({ scene, onScene }: { scene: SceneId; onScene: (s: SceneId) => void }) {
  const mode = useHome((s) => s.mode)
  const devices = useHome((s) => s.devices)
  const activeScene = useHome((s) => s.activeScene)
  const ignored = useIgnoredKeys()
  const scenes = useHome((s) => s.scenes)
  const tapScene = useHome((s) => s.tapScene)
  const resetToScene = useHome((s) => s.resetToScene)

  const changes = modifiedChanges(devices, activeScene, ignored, scenes)
  const changedKeys = new Set(changes.map((c) => c.key))
  const def = SCENES[scene]
  const isActive = mode === 'home' && scene === activeScene
  const modified = isActive && changes.length > 0

  const status = (id: SceneId) =>
    mode === 'home' && id === activeScene
      ? changes.length ? (changes.length === 1 ? t('Active · Modified, 1 change') : t('Active · Modified, {n} changes', { n: changes.length })) : t('Active')
      : t('Not active')

  return (
    <main className={styles.split}>
      <nav className={styles.list} aria-label={t('Scenes')}>
        <h2 className={styles.colh}>{t('Scenes')}</h2>
        <ul className={styles.ul}>
          {SCENE_ORDER.map((id) => {
            const active = mode === 'home' && id === activeScene
            return (
              <li key={id}>
                <button type="button" className={`${styles.item} ${id === scene ? styles.sel : ''}`} aria-current={id === scene ? 'true' : undefined} onClick={() => onScene(id)}>
                  <span className={`${styles.ic} ${active ? styles.icOn : ''}`}><Icon name={SCENES[id].icon} size={22} /></span>
                  <span className={styles.tx}>
                    <span className={styles.name}>{SCENES[id].name}</span>
                    <span className={`${styles.sub} ${active ? styles.subOn : ''}`}>{status(id)}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className={styles.note}>
          <Icon name="info" size={16} className={styles.noteIcon} />
          <span>{t('Scenes change Living Room, Kitchen and Corridor. Only the administrator can edit them.')}</span>
        </p>
      </nav>

      <section className={styles.detail} aria-label={def.name}>
        <header className={styles.head}>
          <h2 className={styles.h2}>{def.name}</h2>
          <p className={styles.desc}>{def.description}</p>
        </header>
        {mode !== 'home' && <Banner icon="lock">{t('Scenes are unavailable in {mode} mode.', { mode: MODE_NAMES[mode] })}</Banner>}
        <div className={styles.rooms}>
          {SHARED_ROOMS.filter((room) => DEVICES.some((d) => d.room === room && isSceneControlled(d.key, scene, scenes))).map((room) => (
            <div key={room} className={styles.group}>
              <h3 className={styles.groupTitle}>{ROOM_NAMES[room]}</h3>
              {DEVICES.filter((d) => d.room === room && isSceneControlled(d.key, scene, scenes)).map((d) => (
                <ListRow key={d.key} icon={d.icon} text={d.label} value={formatValue(d.key, scenes[scene][d.key] as DeviceValue)}
                  badge={isActive && changedKeys.has(d.key) ? t('Changed') : undefined} />
              ))}
            </div>
          ))}
        </div>
        <div className={styles.acts}>
          {modified ? (
            <>
              <Button variant="secondary" onClick={() => tapScene(scene)}>{t('See changes')}</Button>
              <Button onClick={() => resetToScene()}>{t('Reset to scene')}</Button>
            </>
          ) : isActive ? (
            <Button variant="secondary" disabled icon="check">{t('Active')}</Button>
          ) : (
            <Button disabled={mode !== 'home'} onClick={() => tapScene(scene)}>{mode === 'home' ? t('Activate {name}', { name: def.name }) : t('Activate')}</Button>
          )}
        </div>
      </section>
    </main>
  )
}
