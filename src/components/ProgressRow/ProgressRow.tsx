import { Icon } from '../Icon/Icon'
import styles from './ProgressRow.module.css'

type Props = { text: string; status: 'waiting' | 'running' | 'done' | 'failed'; failedLabel?: string }

const LABEL = { waiting: 'Waiting', running: 'In progress', done: 'Done', failed: 'No response' } as const

export function ProgressRow({ text, status, failedLabel }: Props) {
  return (
    <div className={`${styles.row} ${styles[status]}`}>
      <span className={styles.badge}>
        {status === 'done' && <Icon name="check" size={18} />}
        {status === 'failed' && <Icon name="x" size={20} />}
        {status === 'running' && <span className={styles.spinner} />}
      </span>
      <span className={styles.text}>{text}</span>
      <span className={styles.state}>{status === 'failed' && failedLabel ? failedLabel : LABEL[status]}</span>
    </div>
  )
}
