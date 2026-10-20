import { useEffect, useState } from 'react'
import { Icon, type IconName } from './components/Icon/Icon'
import { Switch } from './components/Switch/Switch'
import { LANGS, t, useLang } from './i18n'
import { PhoneFrame } from './components/PhoneFrame/PhoneFrame'
import { TabletFrame } from './components/TabletFrame/TabletFrame'
import { ROOM_NAMES } from './store/data'
import { useHome } from './store/useHome'
import { PhoneApp } from './screens/phone/PhoneApp'
import { TabletApp } from './screens/tablet/TabletApp'
import styles from './App.module.css'

/** Выбор языка: слева вверху, по умолчанию английский */
function LanguageSwitch() {
  const lang = useLang((s) => s.lang)
  const setLang = useLang((s) => s.setLang)
  return (
    <div className={styles.lang} data-lang-switch role="group" aria-label={t('Language')}>
      {LANGS.map((l) => (
        <button key={l.id} type="button" className={styles.langBtn} aria-pressed={lang === l.id} title={l.full} lang={l.id} onClick={() => setLang(l.id)}>
          {l.label}
        </button>
      ))}
    </div>
  )
}

type View = 'all' | 'tablet' | 'marina' | 'alexey'

/** Строка-действие: срабатывает один раз */
function ActionRow({ icon, label, onClick, disabled }: { icon: IconName; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className={styles.row} onClick={onClick} disabled={disabled}>
      <span className={styles.rowIcon}><Icon name={icon} size={20} /></span>
      <span className={styles.rowLabel}>{label}</span>
      <Icon name="chev" size={18} className={styles.rowChev} />
    </button>
  )
}

/** Строка-переключатель: условие действует, пока включено */
function SwitchRow({ icon, label, checked, onChange }: { icon: IconName; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={styles.row} data-on={checked || undefined}>
      <span className={styles.rowIcon}><Icon name={icon} size={20} /></span>
      <span className={styles.rowLabel}>{label}</span>
      <Switch size="sm" checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  )
}

/** Настройки и демо-контент: кнопка справа вверху, меню выезжает справа и сдвигает интерфейс влево */
function PrototypePanel({ view, pick, open, onOpenChange }: { view: View; pick: (v: View) => void; open: boolean; onOpenChange: (v: boolean) => void }) {
  const windows = useHome((s) => s.windowsOpen)
  const failKeys = useHome((s) => s.failKeys)
  const mode = useHome((s) => s.mode)
  const decline = useHome((s) => s.declinePairing)
  const manual = useHome((s) => s.pairingManual)
  const freeze = useHome((s) => s.freezeProgress)
  const flow = useHome((s) => s.addFlow)
  const a = useHome.getState()
  const tvFails = failKeys.includes('living.tv')
  // Клик вне меню (и вне кнопки) или Esc закрывают меню
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const el = e.target as Element | null
      if (el?.closest('#service-panel, [aria-controls="service-panel"], [data-lang-switch]')) return
      onOpenChange(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, onOpenChange])
  return (
    <>
    <button
      type="button"
      className={styles.gear}
      aria-label={open ? t('Close settings') : t('Settings & demo content')}
      aria-expanded={open}
      aria-controls="service-panel"
      onClick={() => onOpenChange(!open)}
    >
      <Icon name={open ? 'x' : 'cog'} size={22} />
      {!open && <span className={styles.gearLabel} aria-hidden="true">{t('Settings & demo content')}</span>}
    </button>
    <aside id="service-panel" className={styles.drawer} aria-label={t('Settings & demo content')} aria-hidden={!open} inert={!open}>
      <div className={styles.drawerInner}>
      <h2 className={styles.drawerTitle}>{t('Settings & demo content')}</h2>

      <section className={styles.group} aria-labelledby="sp-device">
        <h3 id="sp-device" className={styles.groupTitle}>{t('Device')}</h3>
        <div className={styles.devices} role="group" aria-labelledby="sp-device">
          {(['tablet', 'marina', 'alexey', 'all'] as const).map((v) => (
            <button key={v} type="button" className={styles.deviceBtn} aria-pressed={view === v} onClick={() => pick(v)}>
              {v === 'all' ? t('All 3 devices') : v === 'tablet' ? t('Wall tablet') : v === 'marina' ? t('Marina’s phone') : t('Alexey’s phone')}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.group} aria-labelledby="sp-events">
        <h3 id="sp-events" className={styles.groupTitle}>{t('Trigger an event')}</h3>
        <p className={styles.groupHint}>{t('Happens once, as if in the real house.')}</p>
        <div className={styles.list}>
          <ActionRow icon="shield" label={t('Intrusion alarm')} onClick={() => a.triggerAlert('intrusion')} />
          <ActionRow icon="fire" label={t('Smoke in the kitchen')} onClick={() => a.triggerAlert('smoke')} />
          <ActionRow icon="case" label={t('Vacation (from Alexey’s phone)')} disabled={mode === 'vacation'} onClick={() => a.enterVacation()} />
          <ActionRow icon="plus" label={t('Setup flow')} onClick={() => a.setOnboarding('welcome')} />
          <ActionRow icon="moon" label={t('Dim screen')} onClick={a.dim} />
        </div>
      </section>

      <section className={styles.group} aria-labelledby="sp-house">
        <h3 id="sp-house" className={styles.groupTitle}>{t('House state')}</h3>
        <div className={styles.list}>
          <SwitchRow icon="window" label={t('{room} window open', { room: ROOM_NAMES.living })} checked={windows.living} onChange={() => a.toggleWindow('living')} />
          <SwitchRow icon="window" label={t('{room} window open', { room: ROOM_NAMES.kids1 })} checked={windows.kids1} onChange={() => a.toggleWindow('kids1')} />
        </div>
      </section>

      <section className={styles.group} aria-labelledby="sp-fail">
        <h3 id="sp-fail" className={styles.groupTitle}>{t('What goes wrong')}</h3>
        <p className={styles.groupHint}>{t('Turn on to show error and edge cases.')}</p>
        <div className={styles.list}>
          <SwitchRow icon="tv" label={t('TV does not respond to scenes')} checked={tvFails} onChange={() => a.setFailKeys(tvFails ? [] : ['living.tv'])} />
          <SwitchRow icon="lock" label={t('Owner declines pairing')} checked={decline} onChange={() => a.setDeclinePairing(!decline)} />
          <SwitchRow icon="info" label={t('Alexey decides on pairing himself')} checked={manual} onChange={() => a.setPairingManual(!manual)} />
          <SwitchRow icon="grid" label={t('Device search finds nothing')} checked={flow.searchEmpty} onChange={() => a.setAddFlow({ searchEmpty: !flow.searchEmpty })} />
          <SwitchRow icon="warn" label={t('Device setup fails')} checked={flow.connectFails} onChange={() => a.setAddFlow({ connectFails: !flow.connectFails })} />
          <SwitchRow icon="dash" label={t('Progress windows stop halfway')} checked={freeze} onChange={() => a.setFreezeProgress(!freeze)} />
        </div>
      </section>

      <button type="button" className={styles.reset} onClick={a.reset}>{t('Reset demo')}</button>
      </div>
    </aside>
    </>
  )
}

export function App() {
  const lang = useLang((s) => s.lang) // при смене языка перерисовывается весь интерфейс
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  // Стартовая страница — настенный планшет; остальные устройства выбираются в сервисной панели
  const [view, setView] = useState<View>(() => (new URLSearchParams(location.search).get('device') as View) || 'tablet')
  const pick = (v: View) => {
    setView(v)
    if (v === 'all') useHome.getState().setPairingManual(true)
  }
  const [panel, setPanel] = useState(false)
  return (
    <div className={styles.page} data-panel={panel || undefined}>
      <main className={styles.main}>
      {view === 'all' ? (
        <div className={styles.demo}>
          <figure className={styles.cell}><div className={styles.slot}><TabletFrame><TabletApp /></TabletFrame></div><figcaption>{t('Wall tablet')}</figcaption></figure>
          <figure className={styles.cell}><div className={styles.slot}><PhoneFrame label={t('Marina’s phone')}><PhoneApp user="marina" /></PhoneFrame></div><figcaption>{t('Marina · household')}</figcaption></figure>
          <figure className={styles.cell}><div className={styles.slot}><PhoneFrame label={t('Alexey’s phone')}><PhoneApp user="alexey" /></PhoneFrame></div><figcaption>{t('Alexey · administrator')}</figcaption></figure>
        </div>
      ) : (
        <div className={styles.stage}>
          <div className={styles.slot}>
          {view === 'tablet'
            ? <TabletFrame><TabletApp /></TabletFrame>
            : <PhoneFrame label={view === 'marina' ? t('Marina’s phone') : t('Alexey’s phone')}><PhoneApp key={view} user={view} /></PhoneFrame>}
          </div>
        </div>
      )}
      </main>
      <LanguageSwitch />
      <PrototypePanel view={view} pick={pick} open={panel} onOpenChange={setPanel} />
    </div>
  )
}
