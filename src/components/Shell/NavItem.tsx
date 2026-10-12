import { Icon, type IconName } from '../Icon/Icon'
import styles from './Shell.module.css'

export function NavItem({ label, icon, selected, onClick }: { label: string; icon: IconName; selected?: boolean; onClick?: () => void }) {
  return (
    <button type="button" className={`${styles.nav} ${selected ? styles.navOn : ''}`} aria-current={selected ? 'page' : undefined} onClick={onClick}>
      <span className={styles.navIb}><Icon name={icon} size={22} /></span>
      <span className={styles.navText}>{label}</span>
    </button>
  )
}

export function HeaderStat({ icon, label, value, attention }: { icon: IconName; label: string; value: string; attention?: boolean }) {
  return (
    <div className={`${styles.stat} ${attention ? styles.statWarn : ''}`}>
      <span className={styles.statIc}><Icon name={icon} size={20} /></span>
      <span className={styles.statTx}>
        <span className={styles.statK}>{label}</span>
        <span className={styles.statV}>{value}</span>
      </span>
    </div>
  )
}
