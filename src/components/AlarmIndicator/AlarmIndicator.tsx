import { Icon } from '../Icon/Icon'
import styles from './AlarmIndicator.module.css'
import { t } from '../../i18n'

/** Только значок сигнализации: красный с кольцом, когда она включена. Не нажимается. */
export function AlarmIndicator({ on }: { on: boolean }) {
  return (
    <span className={`${styles.root} ${on ? styles.on : ''}`} role="img" aria-label={on ? t('Alarm on') : t('Alarm off')}>
      <Icon name="shield" size={22} />
    </span>
  )
}
