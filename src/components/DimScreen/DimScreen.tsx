import styles from './DimScreen.module.css'
import { t } from '../../i18n'

type Props = { time: string; status: string; onWake: () => void }

/** Ambient-режим: экран не блокируется, остаётся минимум информации. Касание возвращает яркость. */
export function DimScreen({ time, status, onWake }: Props) {
  return (
    <button type="button" className={styles.dim} onClick={onWake} aria-label={t('Wake the display')}>
      <span className={styles.time}>{time}</span>
      <span className={styles.line}>{status}</span>
      <span className={styles.wake}>{t('Tap to wake')}</span>
    </button>
  )
}
