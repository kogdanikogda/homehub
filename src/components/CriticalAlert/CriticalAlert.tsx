import { useEffect, useState } from 'react'
import { Button } from '../Button/Button'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './CriticalAlert.module.css'
import { t } from '../../i18n'

type Props = {
  /** Проникновение — красный, дым — оранжевый */
  tone: 'intrusion' | 'smoke'
  icon: IconName
  title: string
  /** Где сработал датчик */
  where: string
  /** Время срабатывания, ЧЧ:ММ */
  at: string
  /** Момент срабатывания (мс) — для таймера «сколько длится тревога» */
  since: number
  /** Что со звуком: «Siren is on» */
  sound: string
  actionLabel: string
  actionIcon: IconName
  onAction: () => void
  /** Телефон: меньше размеры, кнопка во всю ширину */
  compact?: boolean
}

const elapsed = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Критическая тревога «Маяк»: поверх размытого и притушенного интерфейса,
 * от значка расходятся волны (под остальными элементами), фон «дышит».
 * Остаётся, пока её не подтвердят.
 */
export function CriticalAlert({ tone, icon, title, where, at, since, sound, actionLabel, actionIcon, onAction, compact }: Props) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className={[styles.alert, styles[tone], compact && styles.compact].filter(Boolean).join(' ')} role="alertdialog" aria-label={title}>
      <span className={styles.chip}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.timer}>{t('Alarm · {time}', { time: elapsed(now - since) })}</span>
      </span>
      <div className={styles.mid}>
        <span className={styles.beacon} aria-hidden="true">
          <span className={styles.ring} />
          <span className={styles.ring} />
          <span className={styles.ring} />
          <span className={styles.core}><Icon name={icon} size={compact ? 44 : 64} /></span>
        </span>
        <div className={styles.copy}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.where}>{where}</p>
        </div>
        <div className={styles.facts}>
          <span className={styles.fact}><Icon name="clock" size={compact ? 16 : 22} />{t('Since {at}', { at })}</span>
          <span className={styles.fact}><Icon name="sound" size={compact ? 16 : 22} />{sound}</span>
        </div>
      </div>
      <Button variant="inverse" size={compact ? "lg" : "xl"} icon={actionIcon} onClick={onAction} className={styles.action}>{actionLabel}</Button>
    </div>
  )
}
