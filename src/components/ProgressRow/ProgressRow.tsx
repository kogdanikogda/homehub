import { Icon } from '../Icon/Icon'
import styles from './ProgressRow.module.css'
import { t } from '../../i18n'

type Props = { text: string; status: 'waiting' | 'running' | 'done' | 'failed'; failedLabel?: string; /** Телефон: мельче шрифт, подпись состояния только при сбое, текст в одну строку */ compact?: boolean }

const label = (s: Props['status']) => ({ waiting: t('Waiting'), running: t('In progress'), done: t('Done'), failed: t('No response') })[s]

export function ProgressRow({ text, status, failedLabel, compact }: Props) {
  return (
    <div className={`${styles.row} ${styles[status]} ${compact ? styles.compact : ''}`}>
      <span className={styles.badge}>
        {status === 'done' && <Icon name="check" size={18} />}
        {status === 'failed' && <Icon name="x" size={20} />}
        {status === 'running' && <span className={styles.spinner} />}
      </span>
      <span className={styles.text}>{text}</span>
      <span className={styles.state}>{status === 'failed' && failedLabel ? failedLabel : label(status)}</span>
    </div>
  )
}
