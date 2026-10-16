import { createContext, useContext, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import entrance from '../../assets/cams/entrance.jpg'
import garage from '../../assets/cams/garage.jpg'
import living from '../../assets/cams/living.jpg'
import yard from '../../assets/cams/yard.jpg'
import { Chip, Tag } from '../Chip/Chip'
import { AlarmIndicator } from '../AlarmIndicator/AlarmIndicator'
import { Icon, type IconName } from '../Icon/Icon'
import { Logo } from '../Logo/Logo'
import { ModeMenu, type ModeRowProps } from '../ModeMenu/ModeMenu'
import styles from './Phone.module.css'

/** Системная строка iPhone: время, остров, связь. Высота 59 */
export function PhoneStatusBar() {
  const time = new Date().toTimeString().slice(0, 5)
  return (
    <div className={styles.sysbar} aria-hidden="true">
      <span className={styles.sysTime}>{time}</span>
      <span className={styles.island} />
      <span className={styles.sysIcons}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1.5 4.2a10 10 0 0 1 14 0M4 7a6.5 6.5 0 0 1 9 0" /><circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity=".5" /><rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" /><rect x="25" y="4.5" width="1.5" height="4" rx=".75" fill="currentColor" opacity=".5" /></svg>
      </span>
    </div>
  )
}

export type HeaderBack = { label: string; onClick: () => void }
export type HeaderState = { back?: HeaderBack; title?: string } | null
/** Экран сообщает шапке: «назад» и свой заголовок. Заголовок один, ссылка «назад» стоит над ним. */
export const HeaderCtx = createContext<(h: HeaderState) => void>(() => {})
export function ScreenHeader({ back, title }: { back: HeaderBack; title?: string }) {
  const set = useContext(HeaderCtx)
  const click = useRef(back.onClick)
  click.current = back.onClick
  const { label } = back
  useEffect(() => { set({ back: { label, onClick: () => click.current() }, title }); return () => set(null) }, [set, label, title])
  return null
}

const MODE_ICON: Record<'home' | 'away' | 'vacation', IconName> = { home: 'home', away: 'lock', vacation: 'case' }

/** Шапка телефона: логотип, режим дома (открывает меню) и значок сигнализации. Заголовок экрана прячется на главном экране. */
export function PhoneHeader({ title, subtitle, mode, modeName, alarm, onMode, showTitle = true, back }: {
  title: string; subtitle: string; back?: HeaderBack
  mode: 'home' | 'away' | 'vacation'; modeName: string; alarm: boolean; onMode: () => void; showTitle?: boolean
}) {
  return (
    <header className={styles.header}>
      <PhoneStatusBar />
      <div className={styles.brandRow}>
        <span className={styles.brand}><Logo size={38} /><span className={styles.wordmark}>HomeHub</span></span>
        <button type="button" className={styles.capsule} onClick={onMode} aria-label={`House mode: ${modeName}. Change`} aria-haspopup="dialog">
          <Icon name={MODE_ICON[mode]} size={20} />{modeName}
        </button>
        <AlarmIndicator on={alarm} />
      </div>
      {showTitle && (
        <div className={styles.titles}>
          {back && <BackLink label={back.label} onClick={back.onClick} />}
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      )}
    </header>
  )
}

/** Нижнее окно выбора режима дома. Сигнализация здесь не меняется. */
export function ModeSheet({ rows, onClose }: { rows: ModeRowProps[]; onClose: () => void }) {
  return (
    <div className={styles.sheetWrap} role="dialog" aria-modal="true" aria-label="House mode">
      <button type="button" className={styles.scrim} aria-label="Close" onClick={onClose} />
      <div className={styles.sheet}>
        <span className={styles.grab} />
        <ModeMenu rows={rows} />
      </div>
    </div>
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

export function WarningRow({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div className={styles.warn} role="status">
      <Icon name="warn" size={18} className={styles.warnIcon} />
      <span className={styles.warnText}>{children}</span>
      {onClick && <button type="button" className={styles.warnAction} onClick={onClick}>View</button>}
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

/** Кадры камер (из макета) */
export const CAM_STYLE: Record<CamId, CSSProperties> = {
  yard: { backgroundImage: `url(${yard})`, backgroundSize: 'cover', backgroundPosition: 'center' },
  entrance: { backgroundImage: `url(${entrance})`, backgroundSize: 'cover', backgroundPosition: 'center' },
  garage: { backgroundImage: `url(${garage})`, backgroundSize: 'cover', backgroundPosition: 'center' },
  living: { backgroundImage: `url(${living})`, backgroundSize: 'cover', backgroundPosition: 'center' },
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
export function CamAction({ icon, label, onClick, active, disabled }: { icon: IconName; label: string; onClick?: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button type="button" className={`${styles.camAct} ${active ? styles.camActOn : ''}`} aria-pressed={active} disabled={disabled} onClick={onClick}><Icon name={icon} size={20} />{label}</button>
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
