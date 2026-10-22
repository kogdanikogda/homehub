import { Banner } from '../../components/Banner/Banner'
import { Dialog } from '../../components/Dialog/Dialog'
import { ListRow } from '../../components/ListRow/ListRow'
import { PinPad } from '../../components/PinPad/PinPad'
import { ProgressRow } from '../../components/ProgressRow/ProgressRow'
import { Switch } from '../../components/Switch/Switch'
import { Icon } from '../../components/Icon/Icon'
import styles from './DialogHost.module.css'
import { DEVICE_BY_KEY, PROTOTYPE_PIN, ROOM_NAMES, SCENES, WINDOW_ROOMS } from '../../store/data'
import { deviceTitle, formatValue, modifiedChanges, progressText } from '../../store/logic'
import type { Change, DeviceId, DeviceKey } from '../../store/types'
import { useIgnoredKeys } from '../../store/selectors'
import { useHome } from '../../store/useHome'
import { EnergyDialog } from './EnergyDialog'
import { t } from '../../i18n'

const arrow = (c: Change) => `${formatValue(c.key, c.from)} → ${formatValue(c.key, c.to)}`
const joinNames = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} ${t('and')} ${names[names.length - 1]}` : names[0])

/** Показывает окно, которое просит состояние (одновременно открыто не больше одного) */
/** Подпись шторки Windows на телефоне */
const windowsLead = (open: number, total: number) => (open === 0 ? t('All {total} windows are closed.', { total }) : open === 1 ? t('1 of {total} windows is open.', { total }) : t('{open} of {total} windows are open.', { open, total }))

export function DialogHost({ by = 'tablet', compact }: { by?: DeviceId; compact?: boolean }) {
  const dialog = useHome((s) => s.dialogs[by])
  const devices = useHome((s) => s.devices)
  const ignored = useIgnoredKeys()
  const scenes = useHome((s) => s.scenes)
  const windowsOpen = useHome((s) => s.windowsOpen)
  const a = useHome.getState()
  const close = () => a.closeDialog(by)

  if (!dialog) return null

  switch (dialog.type) {
    case 'override': {
      const def = DEVICE_BY_KEY[dialog.key]
      return (
        <Dialog compact={compact} open onOpenChange={close} title={t('You are modifying the active “{name}” scene', { name: SCENES[dialog.scene].name })}
          note={t('This change will remain active until you change it manually again, or another scene is activated.')}
          primary={{ label: t('Continue'), onClick: () => a.confirmOverride(by) }}>
          <ListRow icon={def.icon} text={deviceTitle(dialog.key)} value={`${formatValue(dialog.key, dialog.from)} → ${formatValue(dialog.key, dialog.to)}`} />
        </Dialog>
      )
    }
    case 'conflict': {
      const name = SCENES[dialog.target].name
      const what = joinNames(dialog.turnOff.map((c) => (c.key === 'living.tv' ? t('the TV') : t('the sound system'))))
      return (
        <Dialog compact={compact} open onOpenChange={close} title={t('Switch to {name}?', { name })} lead={t('Switching to {name} will turn off {what}.', { name, what })}
          primary={{ label: t('Confirm'), onClick: () => a.confirmConflict(by) }}>
          {dialog.turnOff.map((c) => <ListRow key={c.key} icon={DEVICE_BY_KEY[c.key].icon} text={deviceTitle(c.key)} value={t('Off')} />)}
        </Dialog>
      )
    }
    case 'night': {
      const name = SCENES.night.name
      const what = dialog.turnOff.length ? joinNames(dialog.turnOff.map((c) => (c.key === 'living.tv' ? t('the TV') : t('the sound system')))) : ''
      return (
        <Dialog compact={compact} open onOpenChange={close} title={t('Switch to {name}?', { name })}
          lead={what ? t('Switching to {name} will turn off {what}.', { name, what }) : undefined}
          primary={{ label: t('Confirm'), onClick: () => a.confirmNight(by) }}>
          {dialog.turnOff.map((c) => <ListRow key={c.key} icon={DEVICE_BY_KEY[c.key].icon} text={deviceTitle(c.key)} value={t('Off')} />)}
          <label className={styles.option}>
            <span className={styles.optionIcon}><Icon name="shield" size={22} /></span>
            <span className={styles.optionText}>
              <b>{t('Turn on the alarm')}</b>
              <small>{t('The screen will show that the home is armed until the alarm is turned off.')}</small>
            </span>
            <Switch checked={dialog.alarm} onCheckedChange={(v) => a.setNightAlarm(v, by)} aria-label={t('Turn on the alarm')} />
          </label>
        </Dialog>
      )
    }
    case 'changes': {
      const list = modifiedChanges(devices, dialog.scene, ignored, scenes)
      return (
        <Dialog compact={compact} open onOpenChange={close} title={t('{name}: changes from the saved scene', { name: SCENES[dialog.scene].name })}
          note={t('Only the administrator can save these changes to the scene. Until then they are temporary and end when another scene is activated.')}
          primary={{ label: t('Reset to scene'), onClick: () => a.resetToScene(by) }} secondary={{ label: t('Close') }}>
          {list.map((c) => <ListRow key={c.key} icon={DEVICE_BY_KEY[c.key].icon} text={deviceTitle(c.key)} value={arrow(c)} />)}
        </Dialog>
      )
    }
    case 'progress': {
      const finished = dialog.items.filter((i) => i.status === 'done' || i.status === 'failed').length
      const failed = dialog.items.filter((i) => i.status === 'failed')
      return (
        <Dialog compact={compact} open onOpenChange={close} dismissible={dialog.phase !== 'running'}
          title={dialog.phase === 'running' ? dialog.title : dialog.doneTitle}
          counter={t('{done} of {total}', { done: finished, total: dialog.items.length })}
          progress={dialog.items.length ? finished / dialog.items.length : 1}
          note={failed.length
            ? `${failed.length === 1 ? t('Done, but 1 device did not respond') : t('Done, but {n} devices did not respond', { n: failed.length })}: ${failed.map((f) => deviceTitle(f.key as DeviceKey)).join(', ')}. ${t('The administrator has been notified.')}`
            : undefined}
          primary={dialog.holding ? { label: t('▶ Resume (debug)'), onClick: () => a.resumeProgress() } : undefined}
          secondary={dialog.phase === 'failed' || (dialog.phase === 'done' && a.freezeProgress) ? { label: t('Close') } : false}>
          {dialog.items.map((i) => <ProgressRow key={i.key} compact={compact} status={i.status} text={progressText(i)} />)}
        </Dialog>
      )
    }
    case 'confirmAway': {
      const active = a.activeScene
      const rooms = dialog.windows.map((r) => ROOM_NAMES[r])
      return (
        <Dialog compact={compact} open onOpenChange={close} title={t('Switch to Away mode?')} primary={{ label: t('Turn on Away'), onClick: () => a.confirmAway(by) }}>
          <ListRow icon="shield" text={t('The alarm turns on')} />
          <ListRow icon="motion" text={t('Security sensors become active')} />
          <ListRow icon="tv" text={t('TV and sound system turn off')} />
          <ListRow icon="temp" text={t('Climate switches to energy saving')} />
          {active && <ListRow icon="scenes" text={t('The active “{name}” scene ends', { name: SCENES[active].name })} />}
          {rooms.length > 0 && (
            <div style={{ paddingTop: 8 }}>
              <Banner>
                {rooms.length === 1
                  ? t('A window is open: {rooms}. Close it before you leave.', { rooms: rooms[0] })
                  : t('Windows are open: {rooms}. Close them before you leave.', { rooms: rooms.join(', ') })}
              </Banner>
            </div>
          )}
        </Dialog>
      )
    }
    case 'pin':
      return (
        <Dialog compact={compact} centered open onOpenChange={close} width={460}
          title={dialog.purpose === 'home' ? t('Enter PIN to switch to Home') : t('Enter PIN to turn off the alarm')}
          lead={dialog.purpose === 'home' ? t('This turns the alarm off.') : t('This stops the siren.')}>
          <PinPad onSubmit={(p) => a.submitPin(p, by)} hint={t('Prototype PIN: {pin}', { pin: PROTOTYPE_PIN })} />
        </Dialog>
      )
    case 'alarmOff':
      return (
        <Dialog compact={compact} open onOpenChange={close} title={t('Turn off the alarm?')}
          lead={t('Sensors will stop watching the house. The house mode does not change. You can turn the alarm on again at any time.')}
          primary={{ label: t('Turn off alarm'), onClick: () => a.confirmAlarmOff(by) }} />
      )
    case 'energy':
      return <EnergyDialog onClose={close} />
    case 'windows':
      return (
        <Dialog compact={compact} open onOpenChange={close} title={t('Windows')} secondary={{ label: t('Close') }}
          lead={compact ? windowsLead(WINDOW_ROOMS.filter((r) => windowsOpen[r]).length, WINDOW_ROOMS.length) : undefined}>
          {WINDOW_ROOMS.map((r) => (
            <ListRow key={r} text={ROOM_NAMES[r]} value={windowsOpen[r] ? t('Open') : t('Closed')} tone={windowsOpen[r] ? 'warning' : 'default'} />
          ))}
        </Dialog>
      )
  }
}
