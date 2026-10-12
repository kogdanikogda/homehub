import type { ReactNode } from 'react'
import { Chip } from '../Chip/Chip'
import { Icon } from '../Icon/Icon'
import styles from './RoomCard.module.css'

type Props = { title: string; windowOpen?: boolean; children: ReactNode; onAllDevices?: () => void }

export function RoomCard({ title, windowOpen, children, onAllDevices }: Props) {
  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {windowOpen && <Chip tone="warning" icon="window" size="sm">Window open</Chip>}
      </header>
      <div className={styles.devices}>{children}</div>
      <button type="button" className={styles.more} onClick={onAllDevices}>
        All devices <Icon name="chev" size={16} />
      </button>
    </section>
  )
}
