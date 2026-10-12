import { Icon } from '../Icon/Icon'
import styles from './Toast.module.css'

export function Toast({ children }: { children: string }) {
  return (
    <div className={styles.toast} role="status">
      <Icon name="check" size={22} />
      <span>{children}</span>
    </div>
  )
}
