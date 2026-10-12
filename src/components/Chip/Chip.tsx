import type { ReactNode } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './Chip.module.css'

type ChipProps = {
  tone?: 'accent' | 'neutral' | 'warning' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: IconName
  dot?: boolean
  children: ReactNode
}

export function Chip({ tone = 'neutral', size = 'sm', icon, dot, children }: ChipProps) {
  return (
    <span className={`${styles.chip} ${styles[tone]} ${styles[size]}`}>
      {dot && <span className={styles.dot} />}
      {icon && <Icon name={icon} size={size === 'xs' ? 11 : 12} />}
      {children}
    </span>
  )
}

/** Маленькая метка («Private», «Changed») */
export function Tag({ tone = 'neutral', children }: { tone?: 'neutral' | 'warning'; children: ReactNode }) {
  return <span className={`${styles.tag} ${styles[tone]}`}>{children}</span>
}
