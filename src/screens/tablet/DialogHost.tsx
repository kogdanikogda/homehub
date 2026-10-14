import { Banner } from '../../components/Banner/Banner'
import { Dialog } from '../../components/Dialog/Dialog'
import { ListRow } from '../../components/ListRow/ListRow'
import { PinPad } from '../../components/PinPad/PinPad'
import { ProgressRow } from '../../components/ProgressRow/ProgressRow'
import { DEVICE_BY_KEY, PROTOTYPE_PIN, ROOM_NAMES, ROOM_ORDER, SCENES } from '../../store/data'
import { deviceTitle, formatValue, modifiedChanges } from '../../store/logic'
import type { Change, DeviceId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { EnergyDialog } from './EnergyDialog'

const arrow = (c: Change) => `${formatValue(c.key, c.from)} → ${formatValue(c.key, c.to)}`
const joinNames = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0])

/** Показывает окно, которое просит состояние (одновременно открыто не больше одного) */
export function DialogHost({ by = 'tablet', compact }: { by?: DeviceId; compact?: boolean }) {
  const dialog = useHome((s) => s.dialogs[by])
  const devices = useHome((s) => s.devices)
  const unresponsive = useHome((s) => s.unresponsive)
  const scenes = useHome((s) => s.scenes)
  const windowsOpen = useHome((s) => s.windowsOpen)
  const a = useHome.getState()
  const close = () => a.closeDialog(by)

  if (!dialog) return null

  switch (dialog.type) {
    case 'override': {
      const def = DEVICE_BY_KEY[dialog.key]
      return (
        <Dialog compact={compact} open onOpenChange={close} title={`You are modifying the active “${SCENES[dialog.scene].name}” scene`}
          note="This change will remain active until you change it manually again, or another scene is activated."
          primary={{ label: 'Continue', onClick: () => a.confirmOverride(by) }}>
          <ListRow icon={def.icon} text={deviceTitle(dialog.key)} value={`${formatValue(dialog.key, dialog.from)} → ${formatValue(dialog.key, dialog.to)}`} />
        </Dialog>
      )
    }
    case 'conflict': {
      const name = SCENES[dialog.target].name
      const what = joinNames(dialog.turnOff.map((c) => (c.key === 'living.tv' ? 'the TV' : 'the sound system')))
      return (
        <Dialog compact={compact} open onOpenChange={close} title={`Switch to ${name}?`} lead={`Switching to ${name} will turn off ${what}.`}
          primary={{ label: 'Confirm', onClick: () => a.confirmConflict(by) }}>
          {dialog.turnOff.map((c) => <ListRow key={c.key} icon={DEVICE_BY_KEY[c.key].icon} text={deviceTitle(c.key)} value="Off" />)}
        </Dialog>
      )
    }
    case 'changes': {
      const list = modifiedChanges(devices, dialog.scene, unresponsive, scenes)
      return (
        <Dialog compact={compact} open onOpenChange={close} title={`${SCENES[dialog.scene].name}: changes from the saved scene`}
          note="Only the administrator can save these changes to the scene. Until then they are temporary and end when another scene is activated."
          primary={{ label: 'Reset to scene', onClick: () => a.resetToScene(by) }} secondary={{ label: 'Close' }}>
          {list.map((c) => <ListRow key={c.key} icon={DEVICE_BY_KEY[c.key].icon} text={deviceTitle(c.key)} value={arrow(c)} />)}
        </Dialog>
      )
    }
    case 'progress': {
      const name = SCENES[dialog.scene].name
      const finished = dialog.items.filter((i) => i.status === 'done' || i.status === 'failed').length
      const failed = dialog.items.filter((i) => i.status === 'failed')
      return (
        <Dialog compact={compact} open onOpenChange={close} dismissible={dialog.phase !== 'running'}
          title={dialog.phase === 'running' ? `Activating “${name}”` : `${name} scene is on`}
          counter={`${finished} of ${dialog.items.length}`}
          progress={dialog.items.length ? finished / dialog.items.length : 1}
          note={failed.length
            ? `Done, but ${failed.length} device${failed.length > 1 ? 's' : ''} did not respond: ${failed.map((f) => deviceTitle(f.key)).join(', ')}. The administrator has been notified.`
            : undefined}
          secondary={dialog.phase === 'failed' ? { label: 'Close' } : false}>
          {dialog.items.map((i) => <ProgressRow key={i.key} status={i.status} text={`${deviceTitle(i.key)}: ${arrow(i)}`} />)}
        </Dialog>
      )
    }
    case 'confirmAway': {
      const active = a.activeScene
      const rooms = dialog.windows.map((r) => ROOM_NAMES[r])
      return (
        <Dialog compact={compact} open onOpenChange={close} title="Switch to Away mode?" primary={{ label: 'Turn on Away', onClick: () => a.confirmAway(by) }}>
          <ListRow icon="shield" text="The alarm turns on" />
          <ListRow icon="motion" text="Security sensors become active" />
          <ListRow icon="tv" text="TV and sound system turn off" />
          <ListRow icon="temp" text="Climate switches to energy saving" />
          {active && <ListRow icon="scenes" text={`The active “${SCENES[active].name}” scene ends`} />}
          {rooms.length > 0 && (
            <div style={{ paddingTop: 8 }}>
              <Banner>
                {rooms.length === 1
                  ? `A window is open: ${rooms[0]}. Close it before you leave.`
                  : `Windows are open: ${rooms.join(', ')}. Close them before you leave.`}
              </Banner>
            </div>
          )}
        </Dialog>
      )
    }
    case 'pin':
      return (
        <Dialog compact={compact} open onOpenChange={close} width={460}
          title={dialog.purpose === 'home' ? 'Enter PIN to switch to Home' : 'Enter PIN to turn off the alarm'}
          lead={dialog.purpose === 'home' ? 'This turns the alarm off.' : 'This stops the siren.'}>
          <PinPad onSubmit={(p) => a.submitPin(p, by)} hint={`Prototype PIN: ${PROTOTYPE_PIN}`} />
        </Dialog>
      )
    case 'alarmOff':
      return (
        <Dialog compact={compact} open onOpenChange={close} title="Turn off the alarm?"
          lead="Sensors will stop watching the house. The house mode does not change. You can turn the alarm on again at any time."
          primary={{ label: 'Turn off alarm', onClick: () => a.confirmAlarmOff(by) }} />
      )
    case 'energy':
      return <EnergyDialog onClose={close} />
    case 'windows':
      return (
        <Dialog compact={compact} open onOpenChange={close} title="Windows" secondary={{ label: 'Close' }}>
          {ROOM_ORDER.map((r) => (
            <ListRow key={r} icon="window" text={ROOM_NAMES[r]} value={windowsOpen[r] ? 'Open' : 'Closed'} tone={windowsOpen[r] ? 'warning' : 'default'} />
          ))}
        </Dialog>
      )
  }
}
