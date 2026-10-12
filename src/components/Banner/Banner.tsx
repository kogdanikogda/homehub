import type { ReactNode } from 'react'
import { Icon } from '../Icon/Icon'
import styles from './Banner.module.css'

export function Banner({ children, tone = 'warning' }: { children: ReactNode; tone?: 'warning' | 'critical' }) {
  return (
    <div className={`${styles.banner} ${styles[tone]}`} role="status">
      <Icon name="warn" size={20} className={styles.icon} />
      <p>{children}</p>
    </div>
  )
}
