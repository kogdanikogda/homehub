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

type Found = { name: string; kind: string; type: string; brand: string; icon: IconName }
const FOUND: Found[] = [
  { name: 'Floor lamp', kind: 'Light', type: 'Light', brand: 'Lumen · Zigbee', icon: 'light' },
  { name: 'Humidifier', kind: 'Climate', type: 'Climate', brand: 'AirCare · Matter', icon: 'drop' },
  { name: 'Water leak sensor', kind: 'Sensor', type: 'Sensor', brand: 'Aqara · Zigbee', icon: 'drop' },
]

type Stage = 'prepare' | 'searching' | 'none' | 'found' | 'room' | 'name' | 'connecting' | 'error' | 'added'
const STEP_MS = 900
const CONNECT_STEPS = ['Connecting to the device', 'Checking firmware']

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
    const t = setTimeout(() => setStage(useHome.getState().addFlow.searchEmpty ? 'none' : 'found'), 1600)
    return () => clearTimeout(t)
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
      useHome.getState().addDevice({ name: name.trim() || dev.name, room, type: dev.type })
      setStage('added')
    }, STEP_MS * 3 + 500)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [stage, name, dev, room])

  const rowsOf = (failed: boolean): ('waiting' | 'running' | 'done' | 'failed')[] =>
    [0, 1, 2].map((i) => (failed && i === 1 ? 'failed' : i < progress ? 'done' : i === progress && !failed ? 'running' : 'waiting'))
  const labels = [...CONNECT_STEPS, `Adding to ${roomName}`]

  const head = (title: string) => <ScreenHeader back={{ label: 'Cancel', onClick: onClose }} title={title} />
  const btn = (label: string, onClick: () => void, primary = true) => (
    <Button variant={primary ? 'primary' : 'secondary'} size="md" className={styles.btn} onClick={onClick}>{label}</Button>
  )

  if (stage === 'prepare') return (
    <>
      {head("Add a device")}
      <Steps step={1} name="Find" status="Ready to search" />
      <Note>Put the new device in pairing mode. On most devices: hold the button for 5 seconds until the light blinks.</Note>
      <div className={styles.illu}><Icon name="bolt" size={40} /></div>
      {btn('Search nearby', () => setStage('searching'))}
      {btn('Scan QR code on the device', () => setStage('searching'), false)}
    </>
  )
  if (stage === 'searching') return (
    <>
      {head("Searching nearby…")}
      <Steps step={1} name="Find" status="Searching…" />
      <div className={styles.illu}><span className={styles.spin} /></div>
      <Note>Keep the phone within a few metres of the device.</Note>
    </>
  )
  if (stage === 'none') return (
    <>
      {head("No devices found")}
      <Steps step={1} name="Find" status="Nothing found" />
      <Note>Check that the device is powered and still in pairing mode. Pairing mode usually lasts 3 minutes.</Note>
      {btn('Search again', () => { a.setAddFlow({ searchEmpty: false }); setStage('searching') })}
    </>
  )
  if (stage === 'found') return (
    <>
      {head("Found 3 devices")}
      <Steps step={1} name="Find" status="3 devices found" />
      <Note>Choose the one you want to add.</Note>
      <div className={styles.list}>
        {FOUND.map((f) => <SceneRow key={f.name} icon={f.icon} name={f.name} status={`${f.kind} · ${f.brand}`} onClick={() => { setDev(f); setName(f.name); setStage('room') }} />)}
      </div>
    </>
  )
  if (stage === 'room') return (
    <>
      {head(`Where is the ${dev.name.toLowerCase()}?`)}
      <Steps step={2} name="Room" status="Choose a room" />
      <Note>Shared rooms can be controlled from the wall panel. Private rooms are view only there.</Note>
      <div className={styles.list}>
        {ROOM_ORDER.map((r) => (
          <button key={r} type="button" className={styles.pick} onClick={() => { setRoom(r); setStage('name') }}>
            <span className={styles.pickTx}><b>{ROOM_NAMES[r]}</b><small>{isPrivateRoom(r) ? 'Family phones · view only on the panel' : 'Controlled from the wall panel'}</small></span>
            <Icon name="chev" size={18} />
          </button>
        ))}
      </div>
    </>
  )
  if (stage === 'name') return (
    <>
      {head("Name the device")}
      <Steps step={3} name="Name" status="Name your device" />
      <Field label="Name" value={name} onChange={setName} />
      <div className={styles.diff}>
        <ChangeRow label="Room" value={roomName} />
        <ChangeRow label="Type" value={dev.type} />
        <ChangeRow label="Wall panel" value={isPrivateRoom(room) ? 'View only' : 'Everyone can use it'} />
      </div>
      <Note>Add it to a scene later in Scenes → Edit scene.</Note>
      {btn('Add device', () => setStage('connecting'))}
    </>
  )
  if (stage === 'connecting') return (
    <>
      <Steps step={4} name="Connect" status="Pairing in progress" />
      <h2 className={styles.h2}>Connecting…</h2>
      <div className={styles.list}>{labels.map((l, i) => <ProgressRow key={l} text={l} status={rowsOf(false)[i]} />)}</div>
    </>
  )
  if (stage === 'error') return (
    <>
      {head("Couldn’t add the device")}
      <Steps step={4} name="Connect" status="Connection failed" state="error" />
      <div className={styles.list}>{labels.map((l, i) => <ProgressRow key={l} text={l} status={rowsOf(true)[i]} failedLabel="Failed" />)}</div>
      <TechAlert title="" tone="critical">The device stopped responding during setup. Move it closer to the hub and put it in pairing mode again.</TechAlert>
      {btn('Try again', () => { a.setAddFlow({ connectFails: false }); setStage('connecting') })}
    </>
  )
  return (
    <>
      <Steps step={4} name="" status="Ready to use" state="done" />
      <div className={styles.done}>
        <span className={styles.ok}><Icon name="check" size={40} /></span>
        <h2 className={styles.h2}>{name.trim() || dev.name} added</h2>
        <Note>{roomName} · {isPrivateRoom(room) ? 'now on family phones' : 'now on the wall panel in Rooms'}</Note>
        {btn('Done', onClose)}
        {btn('Add another device', () => { setName(''); setStage('prepare') }, false)}
      </div>
    </>
  )
}
