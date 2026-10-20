import styles from './DimScreen.module.css'
import { Icon } from '../Icon/Icon'
import { t } from '../../i18n'

type Props = { time: string; date: string; temperature: string; onWake: () => void }

/**
 * Ambient-режим: экран не блокируется, за «матовым стеклом» видна гостиная.
 * Остаётся минимум: время, дата и температура. Касание возвращает яркость.
 */
export function DimScreen({ time, date, temperature, onWake }: Props) {
  return (
    <button type="button" className={styles.dim} onClick={onWake} aria-label={t('Wake the display')}>
      <span className={styles.time}>{time}</span>
      <span className={styles.info}>
        <span>{date}</span>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.temp}>
          <Icon name="temp" size={26} />
          <span>{temperature}</span>
        </span>
      </span>
      <span className={styles.wake}>{t('Tap to wake')}</span>
    </button>
  )
}
