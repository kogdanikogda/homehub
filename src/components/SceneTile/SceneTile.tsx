import { Icon, type IconName } from '../Icon/Icon'
import { Chip } from '../Chip/Chip'
import styles from './SceneTile.module.css'

type Props = {
  name: string
  icon: IconName
  state?: 'idle' | 'active' | 'modified' | 'unavailable'
  modifiedLabel?: string
  onClick?: () => void
}

export function SceneTile({ name, icon, state = 'idle', modifiedLabel = 'Modified', onClick }: Props) {
  const disabled = state === 'unavailable'
  const on = state === 'active' || state === 'modified'
  return (
    <button type="button" className={`${styles.tile} ${styles[state]}`} disabled={disabled} aria-pressed={on} onClick={onClick}>
      <span className={styles.ic}>
        <Icon name={icon} size={18} />
      </span>
      <span className={styles.tx}>
        <span className={styles.nm}>{name}</span>
        {state === 'active' && <span className={styles.stt}>Active</span>}
        {state === 'unavailable' && <span className={styles.stt}>Unavailable</span>}
        {state === 'modified' && <Chip tone="warning" size="xs">{modifiedLabel}</Chip>}
      </span>
    </button>
  )
}
