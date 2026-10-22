import { useEffect, useState } from 'react'
import { Button } from '../Button/Button'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './CriticalAlert.module.css'
import { t } from '../../i18n'

type Props = {
  /** Проникновение — красный, дым — оранжевый, дом под охраной (Away, Vacation) — спокойный розовый */
  tone: 'intrusion' | 'smoke' | 'armed'
  icon: IconName
  title: string
  /** Где сработал датчик */
  where: string
  /** Время срабатывания или включения режима, ЧЧ:ММ */
  at?: string | null
  /** Момент срабатывания (мс) — для таймера «сколько длится тревога» */
  since?: number
  /** Вторая плашка: что со звуком («Siren is on») или состояние охраны */
  sound: string
  /** Значок второй плашки */
  soundIcon?: IconName
  /** Постоянная надпись в метке сверху вместо таймера (для режима охраны) */
  chip?: string
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
 * Полноэкранное окно «Маяк»: тревога (проникновение, дым) или дом под охраной (Away, Vacation).
 * Перекрывает интерфейс — нажимать можно только кнопку окна.
 * Тревога: поверх размытого и притушенного интерфейса,
 * от значка расходятся волны (под остальными элементами), фон «дышит».
 * Остаётся, пока её не подтвердят.
 */
export function CriticalAlert({ tone, icon, title, where, at, since, sound, soundIcon = 'sound', chip, actionLabel, actionIcon, onAction, compact }: Props) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (chip) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [chip])
  return (
    <div className={[styles.alert, styles[tone], compact && styles.compact].filter(Boolean).join(' ')} role="alertdialog" aria-modal="true" aria-label={title}>
      <span className={styles.chip}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.timer}>{chip ?? t('Alarm · {time}', { time: elapsed(now - (since ?? now)) })}</span>
      </span>
      <div className={styles.mid}>
        <span className={styles.beacon} aria-hidden="true">
          <span className={styles.ring} />
          {tone !== 'armed' && <span className={styles.ring} />}
          {tone !== 'armed' && <span className={styles.ring} />}
          <span className={styles.core}><Icon name={icon} size={compact ? 44 : 64} /></span>
        </span>
        <div className={styles.copy}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.where}>{where}</p>
        </div>
        <div className={styles.facts}>
          {at && <span className={styles.fact}><Icon name="clock" size={compact ? 16 : 22} />{t('Since {at}', { at })}</span>}
          <span className={styles.fact}><Icon name={soundIcon} size={compact ? 16 : 22} />{sound}</span>
        </div>
      </div>
      <Button variant="inverse" size={compact ? "lg" : "xl"} icon={actionIcon} onClick={onAction} className={styles.action}>{actionLabel}</Button>
    </div>
  )
}
