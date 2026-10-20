import { Button } from '../../components/Button/Button'
import { GroupLabel, StatusRow, TechAlert } from '../../components/Phone/Phone'
import { COUNTERTOP, DEVICES, KITCHEN_EXTRAS, PRIVATE_DEVICES, ROOM_NAMES, ROOM_ORDER } from '../../store/data'
import type { RoomId, PrivateRoomId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { isPrivateRoom } from './Dashboard'
import { offlineText } from './TechAlertRow'
import styles from './Phone.module.css'
import { t } from '../../i18n'

/** Все устройства дома со статусом. Недоступное устройство подсвечивается, а наверху — техническое оповещение. */
export function DevicesScreen({ onAdd }: { onAdd: () => void }) {
  const unresponsive = useHome((s) => s.unresponsive)
  const added = useHome((s) => s.addedDevices)
  const text = offlineText(unresponsive, useHome((s) => s.offlineAt))

  const rows = (room: RoomId) => {
    if (isPrivateRoom(room)) return PRIVATE_DEVICES[room as PrivateRoomId].map((d) => ({ key: d.key, icon: d.icon, name: d.label, off: false }))
    const own = DEVICES.filter((d) => d.room === room).map((d) => ({ key: d.key, icon: d.icon, name: d.label, off: unresponsive.includes(d.key) }))
    if (room !== 'kitchen') return own
    // На кухне есть ещё устройства вне сцен; порядок как в макете
    const [light, climate] = own
    return [
      light,
      { key: 'countertop', icon: COUNTERTOP.icon, name: COUNTERTOP.label, off: false },
      { key: KITCHEN_EXTRAS[0].key, icon: KITCHEN_EXTRAS[0].icon, name: KITCHEN_EXTRAS[0].label, off: false },
      climate,
      { key: KITCHEN_EXTRAS[1].key, icon: KITCHEN_EXTRAS[1].icon, name: KITCHEN_EXTRAS[1].label, off: false },
    ]
  }

  return (
    <>
      <div className={styles.group}>
        <Button size="md" icon="plus" className={styles.btn} onClick={onAdd}>{t('Add device')}</Button>
        {text && <TechAlert>{text}</TechAlert>}
      </div>
      {ROOM_ORDER.map((room) => (
        <div key={room} className={styles.group}>
          <GroupLabel tag={isPrivateRoom(room) ? t('Private') : undefined}>{ROOM_NAMES[room]}</GroupLabel>
          <div className={styles.list}>
            {rows(room).map((d) => <StatusRow key={d.key} icon={d.icon} name={d.name} status={d.off ? t('Offline') : t('Online')} tone={d.off ? 'bad' : 'ok'} />)}
            {added.filter((d) => d.room === room).map((d) => <StatusRow key={`add-${d.id}`} icon="light" name={d.name} status={t('Online')} />)}
          </div>
        </div>
      ))}
    </>
  )
}
