import { Button } from '../../components/Button/Button'
import { Icon, type IconName } from '../../components/Icon/Icon'
import { Tag } from '../../components/Chip/Chip'
import { PhoneCard, SectionLabel } from '../../components/Phone/Phone'
import { Segmented } from '../../components/Segmented/Segmented'
import { Stepper } from '../../components/Stepper/Stepper'
import { Switch } from '../../components/Switch/Switch'
import { useHome } from '../../store/useHome'
import styles from './Phone.module.css'
import { t } from '../../i18n'

const roles = (): { icon: IconName; name: string; role: string }[] => [
  { icon: 'home', name: t('Living room wall panel'), role: t('Public panel') },
  { icon: 'grid', name: t('Marina’s phone'), role: t('Household') },
  { icon: 'shield', name: t('Alexey’s phone'), role: t('Administrator · this phone') },
]

export function SettingsScreen() {
  const limits = useHome((s) => s.tempLimits)
  const idle = useHome((s) => s.idleMinutes)
  const opts = useHome((s) => s.vacationOpts)
  const a = useHome.getState()
  const setLimit = (w: 'min' | 'max', v: number) => a.setTempLimit(w, v)

  return (
    <>
      <div className={styles.group}>
        <SectionLabel>{t('Temperature limits')}</SectionLabel>
        <PhoneCard title="">
          <p className={styles.noteText}>{t('Everyone can set room climate only inside this range. The wall panel and Marina’s phone follow it.')}</p>
          <div className={styles.setRow}><span>{t('Lowest')}</span><Stepper label={t('Lowest')} size="sm" value={limits.min} min={14} max={limits.max - 1} step={1} format={(v) => `${v}°`} onChange={(v) => setLimit('min', v)} /></div>
          <div className={styles.setRow}><span>{t('Highest')}</span><Stepper label={t('Highest')} size="sm" value={limits.max} min={limits.min + 1} max={30} step={1} format={(v) => `${v}°`} onChange={(v) => setLimit('max', v)} /></div>
        </PhoneCard>
      </div>

      <div className={styles.group}>
        <SectionLabel>{t('Vacation mode')}</SectionLabel>
        <div className={styles.list}>
          {([['presence', t('Presence simulation in the evening')], ['freeze', t('Freeze protection')], ['cameras', t('Cameras recording')]] as const).map(([k, label]) => (
            <div key={k} className={styles.setItem}><span>{label}</span><Switch size="sm" aria-label={label} checked={opts[k]} onCheckedChange={(v) => a.setVacationOpt(k, v)} /></div>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <SectionLabel>{t('Wall panel')}</SectionLabel>
        <PhoneCard title={t('Dim the screen after')}>
          <Segmented platform="phoneWide" label={t('Dim the screen after')} value={String(idle)} onChange={(v) => a.setIdleMinutes(Number(v) as 1 | 2 | 5)}
            items={[{ value: '1', label: t('1 min') }, { value: '2', label: t('2 min') }, { value: '5', label: t('5 min') }]} />
          <p className={styles.noteText}>{t('Critical alerts always wake the screen.')}</p>
        </PhoneCard>
      </div>

      <div className={styles.group}>
        <SectionLabel>{t('Devices and roles')}</SectionLabel>
        <div className={styles.list}>
          {roles().map((r) => (
            <div key={r.name} className={styles.setItem}>
              <span className={styles.setName}><Icon name={r.icon} size={18} />{r.name}</span><Tag>{r.role}</Tag>
            </div>
          ))}
        </div>
        <Button variant="secondary" size="md" className={styles.btn} onClick={() => a.showToast(t('Waiting for a new panel. Start the setup on it.'), 'alexey')}>{t('Pair a new wall panel')}</Button>
      </div>
    </>
  )
}
