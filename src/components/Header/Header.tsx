import * as Popover from '@radix-ui/react-popover'
import type { ReactNode } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import { HeaderStat } from '../Shell/NavItem'
import { usePortalContainer } from '../portal'
import styles from './Header.module.css'

type Props = {
  time: string
  date: string
  stats: { icon: IconName; label: string; value: string; attention?: boolean }[]
  mode: { icon: IconName; name: string; armed: boolean; alarmOn: boolean }
  menuOpen: boolean
  onMenuOpenChange: (open: boolean) => void
  /** Содержимое меню режимов */
  menu: ReactNode
}

export function Header({ time, date, stats, mode, menuOpen, onMenuOpenChange, menu }: Props) {
  const container = usePortalContainer()
  return (
    <header className={styles.header}>
      <div className={styles.clock}>
        <span className={styles.time}>{time}</span>
        <span className={styles.date}>{date}</span>
      </div>
      <div className={styles.stats}>
        {stats.map((s) => <HeaderStat key={s.label} {...s} />)}
      </div>
      <span className={styles.grow} />
      <Popover.Root open={menuOpen} onOpenChange={onMenuOpenChange}>
        <Popover.Trigger asChild>
          <button type="button" className={styles.mode} aria-label="House mode and alarm">
            <span className={styles.part}>
              <Icon name={mode.icon} size={18} />
              <span className={styles.key}>House mode:</span>
              <span className={styles.accent}>{mode.name}</span>
            </span>
            <span className={styles.divider} />
            <span className={styles.part}>
              <Icon name="shield" size={16} />
              <span className={styles.key}>Alarm:</span>
              <span className={mode.alarmOn ? styles.accent : styles.plain}>{mode.alarmOn ? 'On' : 'Off'}</span>
            </span>
            <Icon name="chev" size={16} className={menuOpen ? styles.chevUp : styles.chevDown} />
          </button>
        </Popover.Trigger>
        <Popover.Portal container={container}>
          <Popover.Content className={styles.popover} align="end" sideOffset={8}>{menu}</Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </header>
  )
}
