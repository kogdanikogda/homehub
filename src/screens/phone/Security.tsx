import { useEffect, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Icon } from '../../components/Icon/Icon'
import { AlarmPill, ScreenHeader, CAM_STYLE, CamAction, CameraTile, ChangeRow, GroupLabel, PhoneCard, SectionLabel, StatusRow, type CamId } from '../../components/Phone/Phone'
import { useHome } from '../../store/useHome'
import styles from './Phone.module.css'
import { locale, t } from '../../i18n'

const camera = (id: CamId, name: string, where: string) => ({ id, get name() { return t(name) }, get where() { return t(where) } })
export const CAMERAS: { id: CamId; name: string; where: string }[] = [
  camera('yard', 'Yard', 'Backyard · outdoor'),
  camera('entrance', 'Entrance', 'Front door · porch'),
  camera('garage', 'Garage', 'Garage · indoor'),
  camera('living', 'Living room', 'Living room · indoor'),
]

const log = (): string[][] => [
  ['19:05', t('Front door locked')],
  ['18:41', t('General scene activated')],
  ['18:40', t('Home mode on · alarm off with PIN')],
  ['08:12', t('Away mode on · alarm on')],
]

/** Камера гостиной дома выключена ради приватности, пока администратор не включит её на время */
export const camIsOff = (id: CamId, mode: string, peek: boolean) => id === 'living' && mode === 'home' && !peek

export function SecurityScreen({ onCamera }: { onCamera: (id: CamId) => void }) {
  const mode = useHome((s) => s.mode)
  const peek = useHome((s) => s.camPeek)
  const locked = useHome((s) => s.doorLocked)
  const a = useHome.getState()
  const armed = useHome((st) => st.alarm)
  const liveLog = useHome((st) => st.eventLog)

  return (
    <>
      <PhoneCard title={t('Alarm')} aside={<AlarmPill on={armed} label={armed ? t('Armed') : t('Disarmed')} />}>
        <p className={styles.noteText}>
          {armed ? t('Sensors are on.') : t('Sensors are off.')} {t('The alarm does not depend on the house mode.')}
        </p>
        <Button variant="secondary" size="md" className={styles.btn} onClick={() => (armed ? a.requestAlarmOff('alexey') : a.armAlarm('alexey'))}>
          {armed ? t('Turn off alarm') : t('Turn on alarm')}
        </Button>
      </PhoneCard>

      <div className={styles.group}>
        <SectionLabel>{t('Cameras')}</SectionLabel>
        <div className={styles.cams}>
          {CAMERAS.map((c) => <CameraTile key={c.id} id={c.id} name={c.name} off={camIsOff(c.id, mode, peek)} onClick={() => onCamera(c.id)} />)}
        </div>
      </div>

      <div className={styles.group}>
        <SectionLabel>{t('Front door')}</SectionLabel>
        <div className={styles.lock}>
          <Icon name="lock" size={18} />
          <span className={styles.lockTx}><span>{t('Smart lock')}</span><small>{locked ? t('Locked') : t('Unlocked')}</small></span>
          <Button variant="secondary" size="sm" onClick={() => a.setDoorLocked(!locked)}>{locked ? t('Unlock') : t('Lock')}</Button>
        </div>
      </div>

      <div className={styles.group}>
        <SectionLabel>{t('Sensors')}</SectionLabel>
        <div className={styles.list}>
          <StatusRow icon="motion" name={t('Motion · Yard')} status={t('Clear')} />
          <StatusRow icon="motion" name={t('Motion · Corridor')} status={t('Clear')} />
          <StatusRow icon="drop" name={t('Water leak · Kitchen')} status={t('Dry')} />
          <StatusRow icon="fire" name={t('Smoke · Kitchen')} status={t('Clear')} />
        </div>
      </div>

      <div className={styles.group}>
        <SectionLabel>{t('Event log')}</SectionLabel>
        <div className={styles.log}>
          {[...liveLog.map((e) => [e.t, e.x]), ...log()].slice(0, 14).map(([time, text], i) => <div key={i + time + text}><span>{time}</span><span>{text}</span></div>)}
        </div>
      </div>
    </>
  )
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer) }, [])
  return now
}
const fmtTime = (d: Date) => `${d.toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'short' })} · ${d.toTimeString().slice(0, 8)}`

export function CameraScreen({ id, onBack, onOther }: { id: CamId; onBack: () => void; onOther: (id: CamId) => void }) {
  const mode = useHome((s) => s.mode)
  const peek = useHome((s) => s.camPeek)
  const alert = useHome((s) => s.alert)
  const a = useHome.getState()
  const now = useNow()
  const [talk, setTalk] = useState(false)
  const [msg, setMsg] = useState('')
  // Смена камеры останавливает разговор и убирает сообщение; уход с экрана размонтирует компонент
  useEffect(() => { setTalk(false); setMsg('') }, [id])
  const cam = CAMERAS.find((c) => c.id === id)!
  const off = camIsOff(id, mode, peek)
  const alarm = id === 'entrance' && alert?.kind === 'intrusion'

  const events: [string, string][] =
    id === 'entrance'
      ? [...(alarm ? [[alert!.at, t('Motion at the entrance · alarm')] as [string, string]] : []), ['19:05', t('Front door locked')], ['18:40', t('Alexey arrived home')], ['14:12', t('Courier at the door')]]
      : id === 'living'
        ? [['18:40', t('Recording stopped · Home mode')], ['08:12', t('Recording started · Away mode')]]
        : [['18:40', t('Motion detected')], ['14:12', t('Motion detected')]]

  return (
    <>
      <div className={styles.group} style={{ gap: 14 }}>
        <ScreenHeader back={{ label: t('Cameras'), onClick: onBack }} />
        <div className={`${styles.view} ${alarm ? styles.viewAlarm : ''}`}>
          <span className={styles.viewImg} style={CAM_STYLE[id]} data-off={off} />
          {off ? (
            <div className={styles.viewOff}>
              <Icon name="lock" size={28} />
              <b>{t('Camera is off')}</b>
              <small>{t('The living room camera stays off in Home mode for privacy.')}</small>
              <Button size="sm" onClick={() => a.setCamPeek(true)}>{t('Turn on for 10 min')}</Button>
            </div>
          ) : (
            <>
              <div className={styles.viewTop}><span className={styles.viewLive}>● {t('LIVE')}</span><span className={styles.viewTime}>{fmtTime(now)}</span></div>
              {alarm && <span className={styles.viewBox}>{t('Motion')}</span>}
              <span className={styles.viewName}>{cam.name}</span>
              {talk && <span className={styles.viewTalk}><Icon name="mic" size={14} />{t('Talking…')}</span>}
            </>
          )}
        </div>
        {msg && <div className={styles.msg} role="status"><Icon name="check" size={20} /><span>{msg}</span></div>}
        <div className={styles.acts}>
          <CamAction icon="camera" label={t('Snapshot')} disabled={off} onClick={() => { a.logEvent(t('Snapshot · {name}', { name: cam.name })); setMsg(t('Snapshot saved to the event log.')) }} />
          {id === 'entrance' && (
            <CamAction icon="mic" label={talk ? t('Stop talking') : t('Talk')} active={talk} onClick={() => { if (!talk) a.logEvent(t('Two-way talk at the entrance')); setTalk(!talk) }} />
          )}
          <CamAction icon="shield" label={t('Security')} onClick={onBack} />
        </div>
        <div className={styles.diff}>
          <ChangeRow label={t('Status')} value={off ? t('Off · privacy at home') : t('Recording')} />
          <ChangeRow label={t('Location')} value={cam.where} />
          <ChangeRow label={t('Quality')} value={t('1080p · night vision auto')} />
          <ChangeRow label={t('Clips')} value={t('Kept for 14 days')} />
        </div>
        {id === 'living' && peek && <Button variant="secondary" size="md" className={styles.btn} onClick={() => a.setCamPeek(false)}>{t('Turn off camera')}</Button>}
      </div>

      <div className={styles.group}>
        <GroupLabel>{t('Today')}</GroupLabel>
        <div className={styles.events}>
          {events.map(([time, text]) => (
            <div key={time + text}><i style={CAM_STYLE[id]} /><span>{time}</span><span>{text}</span></div>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <GroupLabel>{t('Other cameras')}</GroupLabel>
        <div className={styles.strip}>
          {CAMERAS.map((c) => (
            <button key={c.id} type="button" aria-current={c.id === id} className={c.id === id ? styles.stripOn : ''} onClick={() => onOther(c.id)}>
              <i style={CAM_STYLE[c.id]} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
