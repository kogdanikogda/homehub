import { useEffect, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Icon } from '../../components/Icon/Icon'
import { AlarmPill, BackLink, CAM_STYLE, CamAction, CameraTile, ChangeRow, GroupLabel, PhoneCard, SectionLabel, StatusRow, type CamId } from '../../components/Phone/Phone'
import { useHome } from '../../store/useHome'
import styles from './Phone.module.css'

export const CAMERAS: { id: CamId; name: string; where: string }[] = [
  { id: 'yard', name: 'Yard', where: 'Backyard · outdoor' },
  { id: 'entrance', name: 'Entrance', where: 'Front door · porch' },
  { id: 'garage', name: 'Garage', where: 'Garage · indoor' },
  { id: 'living', name: 'Living room', where: 'Living room · indoor' },
]

const LOG = [
  ['19:05', 'Front door locked'],
  ['18:41', 'General scene activated'],
  ['18:40', 'Home mode on · alarm off with PIN'],
  ['08:12', 'Away mode on · alarm on'],
]

/** Камера гостиной дома выключена ради приватности, пока администратор не включит её на время */
export const camIsOff = (id: CamId, mode: string, peek: boolean) => id === 'living' && mode === 'home' && !peek

export function SecurityScreen({ onCamera }: { onCamera: (id: CamId) => void }) {
  const mode = useHome((s) => s.mode)
  const peek = useHome((s) => s.camPeek)
  const locked = useHome((s) => s.doorLocked)
  const a = useHome.getState()
  const armed = mode !== 'home'

  return (
    <>
      <PhoneCard title="Alarm" aside={<AlarmPill on={armed} label={armed ? 'Armed' : 'Disarmed'} />}>
        <p className={styles.noteText}>
          {mode === 'home' ? 'Home mode. Sensors are off.' : mode === 'away' ? 'Away mode. Sensors are on.' : 'Vacation mode. Sensors are on.'}
        </p>
        <Button variant="secondary" size="md" className={styles.btn} onClick={() => (armed ? a.requestHome('alexey') : a.requestAway('alexey'))}>
          {armed ? (mode === 'vacation' ? 'End Vacation · switch to Home' : 'Disarm · switch to Home') : 'Arm · switch to Away'}
        </Button>
      </PhoneCard>

      <div className={styles.group}>
        <SectionLabel>Cameras</SectionLabel>
        <div className={styles.cams}>
          {CAMERAS.map((c) => <CameraTile key={c.id} id={c.id} name={c.name} off={camIsOff(c.id, mode, peek)} onClick={() => onCamera(c.id)} />)}
        </div>
      </div>

      <div className={styles.group}>
        <SectionLabel>Front door</SectionLabel>
        <div className={styles.lock}>
          <Icon name="lock" size={18} />
          <span className={styles.lockTx}><span>Smart lock</span><small>{locked ? 'Locked' : 'Unlocked'}</small></span>
          <Button variant="secondary" size="sm" onClick={() => a.setDoorLocked(!locked)}>{locked ? 'Unlock' : 'Lock'}</Button>
        </div>
      </div>

      <div className={styles.group}>
        <SectionLabel>Sensors</SectionLabel>
        <div className={styles.list}>
          <StatusRow icon="motion" name="Motion · Yard" status="Clear" />
          <StatusRow icon="motion" name="Motion · Corridor" status="Clear" />
          <StatusRow icon="drop" name="Water leak · Kitchen" status="Dry" />
          <StatusRow icon="fire" name="Smoke · Kitchen" status="Clear" />
        </div>
      </div>

      <div className={styles.group}>
        <SectionLabel>Event log</SectionLabel>
        <div className={styles.log}>
          {LOG.map(([t, text]) => <div key={t + text}><span>{t}</span><span>{text}</span></div>)}
        </div>
      </div>
    </>
  )
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  return now
}
const fmtTime = (d: Date) => `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · ${d.toTimeString().slice(0, 8)}`

export function CameraScreen({ id, onBack, onOther }: { id: CamId; onBack: () => void; onOther: (id: CamId) => void }) {
  const mode = useHome((s) => s.mode)
  const peek = useHome((s) => s.camPeek)
  const alert = useHome((s) => s.alert)
  const a = useHome.getState()
  const now = useNow()
  const cam = CAMERAS.find((c) => c.id === id)!
  const off = camIsOff(id, mode, peek)
  const alarm = id === 'entrance' && alert?.kind === 'intrusion'

  const events: [string, string][] =
    id === 'entrance'
      ? [...(alarm ? [[alert!.at, 'Motion at the entrance · alarm'] as [string, string]] : []), ['19:05', 'Front door locked'], ['18:40', 'Alexey arrived home'], ['14:12', 'Courier at the door']]
      : id === 'living'
        ? [['18:40', 'Recording stopped · Home mode'], ['08:12', 'Recording started · Away mode']]
        : [['18:40', 'Motion detected'], ['14:12', 'Motion detected']]

  return (
    <>
      <div className={styles.group} style={{ gap: 14 }}>
        <BackLink label="Cameras" onClick={onBack} />
        <div className={`${styles.view} ${alarm ? styles.viewAlarm : ''}`}>
          <span className={styles.viewImg} style={CAM_STYLE[id]} data-off={off} />
          {off ? (
            <div className={styles.viewOff}>
              <Icon name="lock" size={28} />
              <b>Camera is off</b>
              <small>The living room camera stays off in Home mode for privacy.</small>
              <Button size="sm" onClick={() => a.setCamPeek(true)}>Turn on for 10 min</Button>
            </div>
          ) : (
            <>
              <div className={styles.viewTop}><span className={styles.viewLive}>● LIVE</span><span className={styles.viewTime}>{fmtTime(now)}</span></div>
              {alarm && <span className={styles.viewBox}>Motion</span>}
              <span className={styles.viewName}>{cam.name}</span>
            </>
          )}
        </div>
        <div className={styles.acts}>
          {!off && <CamAction icon="camera" label="Snapshot" onClick={() => a.showToast('Snapshot saved', 'alexey')} />}
          {!off && id !== 'living' && <CamAction icon="mic" label="Talk" onClick={() => a.showToast('Two-way audio is not part of the prototype', 'alexey')} />}
          {off && <CamAction icon="camera" label="Snapshot" />}
          <CamAction icon="shield" label="Security" onClick={onBack} />
        </div>
        <div className={styles.diff}>
          <ChangeRow label="Status" value={off ? 'Off · privacy at home' : 'Recording'} />
          <ChangeRow label="Location" value={cam.where} />
          <ChangeRow label="Quality" value="1080p · night vision auto" />
          <ChangeRow label="Clips" value="Kept for 14 days" />
        </div>
        {id === 'living' && peek && <Button variant="secondary" size="md" className={styles.btn} onClick={() => a.setCamPeek(false)}>Turn off camera</Button>}
      </div>

      <div className={styles.group}>
        <GroupLabel>Today</GroupLabel>
        <div className={styles.events}>
          {events.map(([t, text]) => (
            <div key={t + text}><i style={CAM_STYLE[id]} /><span>{t}</span><span>{text}</span></div>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <GroupLabel>Other cameras</GroupLabel>
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
