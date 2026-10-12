import { Icon, type IconName } from '../Icon/Icon'
import styles from './ModeMenu.module.css'

export type ModeRowProps = {
  icon: IconName
  name: string
  description: string
  current?: boolean
  /** Подпись справа вместо «Current»: «PIN», «Admin only» */
  badge?: string
  locked?: boolean
  onClick?: () => void
}

function ModeRow({ icon, name, description, current, badge, locked, onClick }: ModeRowProps) {
  return (
    <button type="button" className={`${styles.row} ${current ? styles.cur : ''}`} disabled={locked} onClick={onClick}>
      <span className={`${styles.ic} ${current ? styles.icCur : ''}`}><Icon name={icon} size={20} /></span>
      <span className={styles.tx}>
        <span className={styles.name}>{name}</span>
        <span className={styles.small}>{description}</span>
      </span>
      {current && <span className={styles.badgeCur}><Icon name="check" size={16} />Current</span>}
      {!current && badge && (
        <span className={styles.badge}>{locked && <Icon name="lock" size={14} />}{badge}</span>
      )}
    </button>
  )
}

export function ModeMenu({ rows }: { rows: ModeRowProps[] }) {
  return (
    <div className={styles.menu}>
      <p className={styles.head}>House mode</p>
      {rows.map((r) => <ModeRow key={r.name} {...r} />)}
    </div>
  )
}
