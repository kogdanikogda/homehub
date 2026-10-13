import type { ReactNode } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './Banner.module.css'

export function Banner({ children, tone = 'warning', icon = 'warn' }: { children: ReactNode; tone?: 'warning' | 'critical'; icon?: IconName }) {
  return (
    <div className={`${styles.banner} ${styles[tone]}`} role="status">
      <Icon name={icon} size={20} className={styles.icon} />
      <p>{children}</p>
    </div>
  )
}
