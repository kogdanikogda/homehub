import { useEffect, useState } from 'react'
import { Button } from '../../components/Button/Button'
import { Icon, type IconName } from '../../components/Icon/Icon'
import { ChangeRow, ScreenHeader, Field, Note, SceneRow, Steps, TechAlert } from '../../components/Phone/Phone'
import { ProgressRow } from '../../components/ProgressRow/ProgressRow'
import { ROOM_NAMES, ROOM_ORDER } from '../../store/data'
import type { RoomId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { isPrivateRoom } from './Dashboard'
import styles from './Phone.module.css'
import { t } from '../../i18n'

/** Названия и виды переводятся при показе: в хранилище уходит английское имя */
type Found = { name: string; kind: string; type: string; brand: string; icon: IconName }
const FOUND: Found[] = [
  { name: 'Floor lamp', kind: 'Light', type: 'Light', brand: 'Lumen · Zigbee', icon: 'light' },
  { name: 'Humidifier', kind: 'Climate', type: 'Climate', brand: 'AirCare · Matter', icon: 'drop' },
  { name: 'Water leak sensor', kind: 'Sensor', type: 'Sensor', brand: 'Aqara · Zigbee', icon: 'drop' },
]

type Stage = 'prepare' | 'searching' | 'none' | 'found' | 'room' | 'name' | 'connecting' | 'error' | 'added'
const STEP_MS = 900
const connectSteps = () => [t('Connecting to the device'), t('Checking firmware')]

/** Добавление устройства: поиск → комната → имя → подключение → готово */
export function AddDevice({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<Stage>('prepare')
  const [dev, setDev] = useState<Found>(FOUND[0])
  const [room, setRoom] = useState<RoomId>('living')
  const [name, setName] = useState('')
  const [progress, setProgress] = useState(0) // сколько шагов подключения завершено
  const a = useHome.getState()
  const roomName = ROOM_NAMES[room]

  // Поиск: пара секунд, потом результат
  useEffect(() => {
    if (stage !== 'searching') return
    const timer = setTimeout(() => setStage(useHome.getState().addFlow.searchEmpty ? 'none' : 'found'), 1600)
    return () => clearTimeout(timer)
  }, [stage])

  // Подключение: три шага один за другим
  useEffect(() => {
    if (stage !== 'connecting') return
    setProgress(0)
    const t1 = setTimeout(() => setProgress(1), STEP_MS)
    const t2 = setTimeout(() => {
      if (useHome.getState().addFlow.connectFails) setStage('error')
      else setProgress(2)
    }, STEP_MS * 2)
    const t3 = setTimeout(() => {
      if (useHome.getState().addFlow.connectFails) return
      setProgress(3)
    }, STEP_MS * 3)
    const t4 = setTimeout(() => {
      if (useHome.getState().addFlow.connectFails) return
      useHome.getState().addDevice({ name: name.trim() || t(dev.name), room, type: dev.type })
      setStage('added')
    }, STEP_MS * 3 + 500)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [stage, name, dev, room])

  const rowsOf = (failed: boolean): ('waiting' | 'running' | 'done' | 'failed')[] =>
    [0, 1, 2].map((i) => (failed && i === 1 ? 'failed' : i < progress ? 'done' : i === progress && !failed ? 'running' : 'waiting'))
  const labels = [...connectSteps(), t('Adding to {room}', { room: roomName })]

  const head = (title: string) => <ScreenHeader back={{ label: t('Cancel'), onClick: onClose }} title={title} />
  const btn = (label: string, onClick: () => void, primary = true) => (
    <Button variant={primary ? 'primary' : 'secondary'} size="md" className={styles.btn} onClick={onClick}>{label}</Button>
  )

  if (stage === 'prepare') return (
    <>
      {head(t('Add a device'))}
      <Steps step={1} name={t('Find')} status={t('Ready to search')} />
      <Note>{t('Put the new device in pairing mode. On most devices: hold the button for 5 seconds until the light blinks.')}</Note>
      <div className={styles.illu}><Icon name="bolt" size={40} /></div>
      {btn(t('Search nearby'), () => setStage('searching'))}
      {btn(t('Scan QR code on the device'), () => setStage('searching'), false)}
    </>
  )
  if (stage === 'searching') return (
    <>
      {head(t('Searching nearby…'))}
      <Steps step={1} name={t('Find')} status={t('Searching…')} />
      <div className={styles.illu}><span className={styles.spin} /></div>
      <Note>{t('Keep the phone within a few metres of the device.')}</Note>
    </>
  )
  if (stage === 'none') return (
    <>
      {head(t('No devices found'))}
      <Steps step={1} name={t('Find')} status={t('Nothing found')} />
      <Note>{t('Check that the device is powered and still in pairing mode. Pairing mode usually lasts 3 minutes.')}</Note>
      {btn(t('Search again'), () => { a.setAddFlow({ searchEmpty: false }); setStage('searching') })}
    </>
  )
  if (stage === 'found') return (
    <>
      {head(t('Found 3 devices'))}
      <Steps step={1} name={t('Find')} status={t('3 devices found')} />
      <Note>{t('Choose the one you want to add.')}</Note>
      <div className={styles.list}>
        {FOUND.map((f) => <SceneRow key={f.name} icon={f.icon} name={t(f.name)} status={`${t(f.kind)} · ${f.brand}`} onClick={() => { setDev(f); setName(t(f.name)); setStage('room') }} />)}
      </div>
    </>
  )
  if (stage === 'room') return (
    <>
      {head(t('Where is the {device}?', { device: t(dev.name).toLowerCase() }))}
      <Steps step={2} name={t('Room')} status={t('Choose a room')} />
      <Note>{t('Shared rooms can be controlled from the wall panel. Private rooms are view only there.')}</Note>
      <div className={styles.list}>
        {ROOM_ORDER.map((r) => (
          <button key={r} type="button" className={styles.pick} onClick={() => { setRoom(r); setStage('name') }}>
            <span className={styles.pickTx}><b>{ROOM_NAMES[r]}</b><small>{isPrivateRoom(r) ? t('Family phones · view only on the panel') : t('Controlled from the wall panel')}</small></span>
            <Icon name="chev" size={18} />
          </button>
        ))}
      </div>
    </>
  )
  if (stage === 'name') return (
    <>
      {head(t('Name the device'))}
      <Steps step={3} name={t('Name')} status={t('Name your device')} />
      <Field label={t('Name')} value={name} onChange={setName} />
      <div className={styles.diff}>
        <ChangeRow label={t('Room')} value={roomName} />
        <ChangeRow label={t('Type')} value={t(dev.type)} />
        <ChangeRow label={t('Wall panel')} value={isPrivateRoom(room) ? t('View only') : t('Everyone can use it')} />
      </div>
      <Note>{t('Add it to a scene later in Scenes → Edit scene.')}</Note>
      {btn(t('Add device'), () => setStage('connecting'))}
    </>
  )
  if (stage === 'connecting') return (
    <>
      <Steps step={4} name={t('Connect')} status={t('Pairing in progress')} />
      <h2 className={styles.h2}>{t('Connecting…')}</h2>
      <div className={styles.list}>{labels.map((l, i) => <ProgressRow key={l} text={l} status={rowsOf(false)[i]} />)}</div>
    </>
  )
  if (stage === 'error') return (
    <>
      {head(t('Couldn’t add the device'))}
      <Steps step={4} name={t('Connect')} status={t('Connection failed')} state="error" />
      <div className={styles.list}>{labels.map((l, i) => <ProgressRow key={l} text={l} status={rowsOf(true)[i]} failedLabel={t('Failed')} />)}</div>
      <TechAlert title="" tone="critical">{t('The device stopped responding during setup. Move it closer to the hub and put it in pairing mode again.')}</TechAlert>
      {btn(t('Try again'), () => { a.setAddFlow({ connectFails: false }); setStage('connecting') })}
    </>
  )
  return (
    <>
      <Steps step={4} name="" status={t('Ready to use')} state="done" />
      <div className={styles.done}>
        <span className={styles.ok}><Icon name="check" size={40} /></span>
        <h2 className={styles.h2}>{t('{name} added', { name: name.trim() || t(dev.name) })}</h2>
        <Note>{roomName} · {isPrivateRoom(room) ? t('now on family phones') : t('now on the wall panel in Rooms')}</Note>
        {btn(t('Done'), onClose)}
        {btn(t('Add another device'), () => { setName(''); setStage('prepare') }, false)}
      </div>
    </>
  )
}
