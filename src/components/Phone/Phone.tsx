import type { ReactNode } from 'react'
import { Chip, Tag } from '../Chip/Chip'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './Phone.module.css'

/** Заголовок экрана: название и роль */
export function PhoneHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  )
}

export type TabDef<T extends string> = { id: T; label: string; icon: IconName }

/** Нижнее меню: три вкладки у семьи, шесть у администратора */
export function TabBar<T extends string>({ tabs, value, onChange }: { tabs: TabDef<T>[]; value: T; onChange: (t: T) => void }) {
  return (
    <nav className={styles.tabs} aria-label="Main">
      {tabs.map((t) => (
        <button key={t.id} type="button" className={`${styles.tab} ${t.id === value ? styles.tabOn : ''}`} aria-current={t.id === value ? 'page' : undefined} onClick={() => onChange(t.id)}>
          <Icon name={t.icon} size={20} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

/** Область прокрутки между заголовком и меню */
export function PhoneBody({ children, gap = 18 }: { children: ReactNode; gap?: number }) {
  return <div className={styles.body} style={{ gap }}>{children}</div>
}

export function PhoneCard({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function AlarmPill({ on }: { on: boolean }) {
  return (
    <span className={styles.pill}><Icon name="shield" size={14} />{on ? 'Alarm on' : 'Alarm off'}</span>
  )
}

export function SceneChip({ icon, name, selected, onClick, disabled }: { icon: IconName; name: string; selected?: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" className={`${styles.chip} ${selected ? styles.chipOn : ''}`} disabled={disabled} aria-pressed={selected} onClick={onClick}>
      <Icon name={icon} size={16} />
      <span>{name}</span>
    </button>
  )
}

export function StatTile({ icon, value, caption, attention, onClick }: { icon: IconName; value: string; caption: string; attention?: boolean; onClick?: () => void }) {
  const Tagname = onClick ? 'button' : 'div'
  return (
    <Tagname className={`${styles.stat} ${attention ? styles.statWarn : ''}`} {...(onClick ? { type: 'button' as const, onClick } : {})}>
      <Icon name={icon} size={18} />
      <b>{value}</b>
      <span>{caption}</span>
    </Tagname>
  )
}

export function WarningRow({ children }: { children: ReactNode }) {
  return (
    <div className={styles.warn} role="status">
      <Icon name="warn" size={18} className={styles.warnIcon} />
      <span>{children}</span>
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className={styles.label}>{children}</h2>
}

/** Строка комнаты: название, сводка, температура, стрелка */
export function RoomRow({ name, sub, temp, priv, onClick }: { name: string; sub: string; temp: number; priv?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={styles.room} onClick={onClick}>
      <span className={styles.roomTx}><b>{name}</b><small>{sub}</small></span>
      {priv && <Tag>Private</Tag>}
      <span className={styles.roomTemp}>{temp}°</span>
      <Icon name="chev" size={16} className={styles.chev} />
    </button>
  )
}

export function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.back} onClick={onClick}>
      <Icon name="back" size={18} />{label}
    </button>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>
}

/** Строка списка сцен */
export function SceneRow({ icon, name, status, warn, onClick }: { icon: IconName; name: string; status: string; warn?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={styles.sceneRow} onClick={onClick}>
      <span className={styles.sceneIc}><Icon name={icon} size={20} /></span>
      <span className={styles.roomTx}><b className={styles.sceneName}>{name}</b><small className={warn ? styles.warnText : ''}>{status}</small></span>
      <Icon name="chev" size={18} className={styles.chev} />
    </button>
  )
}

/** Строка «название — значение» */
export function ChangeRow({ label, value, small }: { label: string; value?: string; small?: string }) {
  return (
    <div className={styles.change}>
      <span className={styles.changeTx}><span>{label}</span>{small && <small>{small}</small>}</span>
      {value && <b>{value}</b>}
    </div>
  )
}

export function PrivateChip() {
  return <Chip tone="neutral" size="xs">Private</Chip>
}
