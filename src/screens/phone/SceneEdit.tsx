import { useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Icon } from '../../components/Icon/Icon'
import { Note, ScreenHeader } from '../../components/Phone/Phone'
import { Segmented } from '../../components/Segmented/Segmented'
import { Stepper } from '../../components/Stepper/Stepper'
import { DEVICES, SCENES } from '../../store/data'
import { deviceTitle, formatValue } from '../../store/logic'
import type { DeviceDef, DeviceKey, DeviceValue, SceneId } from '../../store/types'
import { useHome } from '../../store/useHome'
import styles from './Phone.module.css'
import { t } from '../../i18n'

type Draft = Partial<Record<DeviceKey, DeviceValue>>

/** Редактор сцены: каждому устройству можно задать значение или исключить его из сцены */
export function SceneEdit({ scene, onBack }: { scene: SceneId; onBack: () => void }) {
  const saved = useHome((s) => s.scenes[scene])
  const limits = useHome((s) => s.tempLimits)
  const [draft, setDraft] = useState<Draft>({ ...saved })
  const name = SCENES[scene].name
  const set = (k: DeviceKey, v: DeviceValue) => setDraft((d) => ({ ...d, [k]: v }))
  const drop = (k: DeviceKey) => setDraft((d) => { const n = { ...d }; delete n[k]; return n })

  const control = (d: DeviceDef) => {
    const v = draft[d.key] as DeviceValue
    switch (d.kind) {
      case 'dimmer': return <Stepper label={d.label} size="sm" value={Number(v)} min={0} max={100} step={10} format={(x) => formatValue(d.key, x)} onChange={(x) => set(d.key, x)} />
      case 'climate': return <Stepper label={d.label} size="sm" value={Number(v)} min={limits.min} max={limits.max} step={1} format={(x) => `${x}°`} onChange={(x) => set(d.key, x)} />
      case 'rgb': return <Segmented platform="phone" label={d.label} value={String(v)} onChange={(x) => set(d.key, x)} items={[{ value: 'off', label: t('Off') }, { value: 'low', label: t('Low') }, { value: 'high', label: t('High') }]} />
      case 'curtains': return <Segmented platform="phone" label={d.label} value={String(v)} onChange={(x) => set(d.key, x)} items={[{ value: 'open', label: t('Open') }, { value: 'closed', label: t('Closed') }]} />
      case 'toggle': return <Segmented platform="phone" label={d.label} value={v ? 'on' : 'off'} onChange={(x) => set(d.key, x === 'on')} items={[{ value: 'on', label: t('On') }, { value: 'off', label: t('Off') }]} />
    }
  }

  return (
    <>
      <ScreenHeader back={{ label: t('Cancel'), onClick: onBack }} title={t('Edit {name}', { name })} />
      <Note>{t('Set what this scene does in the shared rooms. Devices marked “Not in scene” stay as they are when the scene starts.')}</Note>
      <div className={styles.list} style={{ gap: 8 }}>
        {DEVICES.map((d) => {
          const included = d.key in draft
          return (
            <div key={d.key} className={`${styles.erow} ${included ? '' : styles.erowSkip}`}>
              <div className={styles.ehd}>
                <span><Icon name={d.icon} size={16} />{deviceTitle(d.key)}</span>
                <button type="button" onClick={() => (included ? drop(d.key) : set(d.key, SCENES[scene].values[d.key]))}>{included ? t('Not in scene') : t('Include')}</button>
              </div>
              {included && control(d)}
            </div>
          )
        })}
      </div>
      <Button size="md" className={styles.btn} onClick={() => { useHome.getState().saveScene(scene, draft); onBack() }}>{t('Save scene')}</Button>
    </>
  )
}
