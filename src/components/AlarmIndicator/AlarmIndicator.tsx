import { Icon } from '../Icon/Icon'
import styles from './AlarmIndicator.module.css'

/** Только значок сигнализации: красный с кольцом, когда она включена. Не нажимается. */
export function AlarmIndicator({ on }: { on: boolean }) {
  return (
    <span className={`${styles.root} ${on ? styles.on : ''}`} role="img" aria-label={on ? 'Alarm on' : 'Alarm off'}>
      <Icon name="shield" size={22} />
    </span>
  )
}
