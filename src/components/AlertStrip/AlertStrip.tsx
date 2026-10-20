import { Icon } from '../Icon/Icon'
import styles from './AlertStrip.module.css'
import { t } from '../../i18n'

type Props = { text: string; actionLabel?: string; onAction?: () => void }

export function AlertStrip({ text, actionLabel = t('Details'), onAction }: Props) {
  return (
    <div className={styles.strip} role="status">
      <Icon name="warn" size={20} className={styles.icon} />
      <span className={styles.text}>{text}</span>
      {onAction && <button type="button" className={styles.btn} onClick={onAction}>{actionLabel}</button>}
    </div>
  )
}
