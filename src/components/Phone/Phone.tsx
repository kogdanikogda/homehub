import type { CSSProperties, ReactNode } from 'react'
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
      {(title || aside) && (
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>{title}</h2>
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

export function AlarmPill({ on, label }: { on: boolean; label?: string }) {
  return (
    <span className={styles.pill}><Icon name="shield" size={14} />{label ?? (on ? 'Alarm on' : 'Alarm off')}</span>
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

/** Техническое оповещение: устройство не отвечает */
export function TechAlert({ title = 'Technical alert', children, tone = 'warning' }: { title?: string; children: ReactNode; tone?: 'warning' | 'critical' }) {
  return (
    <div className={`${styles.alert} ${tone === 'critical' ? styles.alertCrit : ''}`} role="status">
      <Icon name="warn" size={20} className={tone === 'critical' ? styles.critIcon : styles.warnIcon} />
      <span className={styles.alertTx}>{title && <b>{title}</b>}<span>{children}</span></span>
    </div>
  )
}

/** Строка только для чтения: иконка, название, статус цветом */
export function StatusRow({ icon, name, status, tone = 'ok' }: { icon: IconName; name: string; status: string; tone?: 'ok' | 'off' | 'bad' }) {
  return (
    <div className={styles.status}>
      <Icon name={icon} size={18} className={styles.statusIcon} />
      <span className={styles.statusName}>{name}</span>
      <span className={`${styles.statusVal} ${styles[`st_${tone}`]}`}>{status}</span>
    </div>
  )
}

/** Название группы, у которой рядом метка («Kids Room 1 · Private») */
export function GroupLabel({ children, tag }: { children: ReactNode; tag?: string }) {
  return <div className={styles.groupLabel}><h2 className={styles.label}>{children}</h2>{tag && <Tag>{tag}</Tag>}</div>
}

export type CamId = 'yard' | 'entrance' | 'garage' | 'living'

/** Фон камеры. Это рисованные заглушки: реальные кадры в прототипе не нужны */
export const CAM_STYLE: Record<CamId, CSSProperties> = {
  yard: { background: 'radial-gradient(120% 90% at 30% 110%, #2b3a22 0%, transparent 60%), linear-gradient(#14202e, #1b2a1d)' },
  entrance: { background: 'radial-gradient(60% 70% at 70% 40%, #8a6a3a 0%, transparent 55%), linear-gradient(#12161d, #1d1812)' },
  garage: { background: 'radial-gradient(70% 60% at 55% 60%, #3b4a58 0%, transparent 65%), linear-gradient(#1a2028, #0e1218)' },
  living: { background: 'radial-gradient(80% 80% at 40% 50%, #5a4a3c 0%, transparent 70%), linear-gradient(#2a2420, #171412)' },
}

export function CameraTile({ id, name, off, onClick }: { id: CamId; name: string; off?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`${styles.cam} ${off ? styles.camOff : ''}`} onClick={onClick} aria-label={`${name} camera`}>
      <span className={styles.camImg} style={CAM_STYLE[id]} />
      <span className={styles.camShade} />
      <span className={styles.camLive}>{off ? <><Icon name="lock" size={12} />Off</> : '● Live'}</span>
      <b>{name}</b>
      <small>{off ? 'Off · privacy at home' : 'Recording'}</small>
    </button>
  )
}

/** Крупная плитка действия камеры (Snapshot, Talk, Security) */
export function CamAction({ icon, label, onClick }: { icon: IconName; label: string; onClick?: () => void }) {
  return (
    <button type="button" className={styles.camAct} onClick={onClick}><Icon name={icon} size={20} />{label}</button>
  )
}

/** Полоска шагов добавления устройства: тонкие сегменты и подпись */
export function Steps({ step, total = 4, name, status, state = 'active' }: { step: number; total?: number; name: string; status: string; state?: 'active' | 'error' | 'done' }) {
  return (
    <div className={styles.steps} role="group" aria-label={state === 'done' ? 'Done' : `Step ${step} of ${total}`}>
      <div className={styles.segs}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1
          const cls = state === 'done' || n < step ? styles.segDone : n === step ? (state === 'error' ? styles.segErr : styles.segNow) : ''
          return <i key={n} className={`${styles.seg} ${cls}`} />
        })}
      </div>
      <p className={styles.stepTx}>
        <b>{state === 'done' ? 'Done' : `Step ${step} of ${total}`}</b>{name && <span className={styles.stepName}>· {name}</span>}
        <em className={state === 'error' ? styles.stepBad : ''}>{status}</em>
      </p>
    </div>
  )
}

export function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} maxLength={32} />
    </label>
  )
}

export function CheckRow({ checked, onChange, label, small }: { checked: boolean; onChange: (v: boolean) => void; label: string; small: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} className={styles.checkRow} onClick={() => onChange(!checked)}>
      <span className={`${styles.chk} ${checked ? styles.chkOn : ''}`}>{checked && <Icon name="check" size={16} />}</span>
      <span className={styles.changeTx}><span>{label}</span><small>{small}</small></span>
    </button>
  )
}
