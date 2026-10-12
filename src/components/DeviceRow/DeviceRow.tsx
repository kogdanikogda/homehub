import type { ReactNode } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import { Tag } from '../Chip/Chip'
import styles from './DeviceRow.module.css'

type Props = {
  label: string
  icon: IconName
  /** Элемент управления справа: Stepper, Segmented, Switch и т.д. */
  control?: ReactNode
  platform?: 'tablet' | 'phone'
  /** Устройство входит в активную сцену */
  inScene?: boolean
  changed?: boolean
  unavailable?: boolean
  /** Статус вместо управления, например «Offline» */
  status?: string
}

export function DeviceRow({ label, icon, control, platform = 'tablet', inScene, changed, unavailable, status }: Props) {
  return (
    <div className={`${styles.row} ${styles[platform]}`}>
      <div className={styles.label}>
        <Icon name={icon} size={18} className={styles.icon} />
        <span className={unavailable ? styles.dim : styles.name}>{label}</span>
        {changed && <Tag tone="warning">Changed</Tag>}
        {inScene && (
          <span className={styles.mark} title="Входит в сцену" role="img" aria-label="Входит в сцену">
            <Icon name="sun" size={14} />
          </span>
        )}
      </div>
      {status ? <span className={styles.status}>{status}</span> : control}
    </div>
  )
}
