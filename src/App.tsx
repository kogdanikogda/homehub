import { useEffect, useState } from 'react'
import { Button } from './components/Button/Button'
import { Icon } from './components/Icon/Icon'
import { LANGS, t, useLang } from './i18n'
import { PhoneFrame } from './components/PhoneFrame/PhoneFrame'
import { TabletFrame } from './components/TabletFrame/TabletFrame'
import { ROOM_NAMES } from './store/data'
import { useHome } from './store/useHome'
import { PhoneApp } from './screens/phone/PhoneApp'
import { TabletApp } from './screens/tablet/TabletApp'
import styles from './App.module.css'

/** Панель, которой в прототипе вызывают события «из жизни дома» */
/** Выбор языка: слева вверху, по умолчанию английский */
function LanguageSwitch() {
  const lang = useLang((s) => s.lang)
  const setLang = useLang((s) => s.setLang)
  return (
    <div className={styles.lang} role="group" aria-label={t('Language')}>
      {LANGS.map((l) => (
        <button key={l.id} type="button" className={styles.langBtn} aria-pressed={lang === l.id} title={l.full} lang={l.id} onClick={() => setLang(l.id)}>
          {l.label}
        </button>
      ))}
    </div>
  )
}

type View = 'all' | 'tablet' | 'marina' | 'alexey'

function PrototypePanel({ view, pick }: { view: View; pick: (v: View) => void }) {
  const [open, setOpen] = useState(false)
  const windows = useHome((s) => s.windowsOpen)
  const failKeys = useHome((s) => s.failKeys)
  const mode = useHome((s) => s.mode)
  const decline = useHome((s) => s.declinePairing)
  const manual = useHome((s) => s.pairingManual)
  const freeze = useHome((s) => s.freezeProgress)
  const flow = useHome((s) => s.addFlow)
  const a = useHome.getState()
  const tvFails = failKeys.includes('living.tv')
  return (
    <>
    <button
      type="button"
      className={styles.gear}
      aria-label={t('Service panel')}
      aria-expanded={open}
      aria-controls="service-panel"
      onClick={() => setOpen(!open)}
    >
      <Icon name="cog" size={24} />
    </button>
    {open && (
    <aside id="service-panel" className={styles.panel} aria-label={t('Service panel')}>
      <span className={styles.label}>{t('Device')}</span>
      <div className={styles.devices} role="group" aria-label={t('Device')}>
        {(['tablet', 'marina', 'alexey', 'all'] as const).map((v) => (
          <Button key={v} size="sm" variant={view === v ? 'primary' : 'secondary'} aria-pressed={view === v} onClick={() => pick(v)}>
            {v === 'all' ? t('All 3 devices') : v === 'tablet' ? t('Wall tablet') : v === 'marina' ? t('Marina’s phone') : t('Alexey’s phone')}
          </Button>
        ))}
      </div>
      <span className={styles.label}>{t('Events')}</span>
      <Button size="sm" variant="secondary" onClick={() => a.toggleWindow('living')}>
        {windows.living ? t('Close {room} window', { room: ROOM_NAMES.living }) : t('Open {room} window', { room: ROOM_NAMES.living })}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.toggleWindow('kids1')}>
        {windows.kids1 ? t('Close {room} window', { room: ROOM_NAMES.kids1 }) : t('Open {room} window', { room: ROOM_NAMES.kids1 })}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.triggerAlert('intrusion')}>{t('Intrusion alarm')}</Button>
      <Button size="sm" variant="secondary" onClick={() => a.triggerAlert('smoke')}>{t('Smoke in the kitchen')}</Button>
      <Button size="sm" variant="secondary" disabled={mode === 'vacation'} onClick={() => a.enterVacation()}>{t('Vacation (from Alexey’s phone)')}</Button>
      <Button size="sm" variant="secondary" onClick={() => a.setFailKeys(tvFails ? [] : ['living.tv'])}>
        {tvFails ? t('TV will not respond to scenes') : t('TV responds to scenes')}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.setOnboarding('welcome')}>{t('Setup flow')}</Button>
      <Button size="sm" variant="secondary" onClick={() => a.setDeclinePairing(!decline)}>
        {decline ? t('Owner declines pairing') : t('Owner approves pairing')}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.setPairingManual(!manual)}>
        {manual ? t('Pairing: decided on Alexey’s phone') : t('Pairing: decided automatically')}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.setAddFlow({ searchEmpty: !flow.searchEmpty })}>
        {flow.searchEmpty ? t('Device search finds nothing') : t('Device search finds devices')}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.setAddFlow({ connectFails: !flow.connectFails })}>
        {flow.connectFails ? t('Device setup fails') : t('Device setup succeeds')}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => a.setFreezeProgress(!freeze)}>
        {freeze ? t('Progress windows: freeze halfway (debug)') : t('Progress windows: run normally')}
      </Button>
      <Button size="sm" variant="secondary" onClick={a.dim}>{t('Dim screen')}</Button>
      <Button size="sm" variant="secondary" onClick={a.reset}>{t('Reset')}</Button>
    </aside>
    )}
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
  return (
    <div className={styles.page}>
      {view === 'all' ? (
        <div className={styles.demo}>
          <figure className={styles.cell}><div className={styles.slot}><TabletFrame><TabletApp /></TabletFrame></div><figcaption>{t('Wall tablet')}</figcaption></figure>
          <figure className={styles.cell}><div className={styles.slot}><PhoneFrame label={t('Marina’s phone')}><PhoneApp user="marina" /></PhoneFrame></div><figcaption>{t('Marina · household')}</figcaption></figure>
          <figure className={styles.cell}><div className={styles.slot}><PhoneFrame label={t('Alexey’s phone')}><PhoneApp user="alexey" /></PhoneFrame></div><figcaption>{t('Alexey · administrator')}</figcaption></figure>
        </div>
      ) : (
        <div className={styles.stage}>
          {view === 'tablet'
            ? <TabletFrame><TabletApp /></TabletFrame>
            : <PhoneFrame label={view === 'marina' ? t('Marina’s phone') : t('Alexey’s phone')}><PhoneApp key={view} user={view} /></PhoneFrame>}
        </div>
      )}
      <LanguageSwitch />
      <PrototypePanel view={view} pick={pick} />
    </div>
  )
}
