import { Segmented } from '../../components/Segmented/Segmented'
import { Stepper } from '../../components/Stepper/Stepper'
import { Switch } from '../../components/Switch/Switch'
import { TEMP_LIMITS } from '../../store/data'
import { formatValue } from '../../store/logic'
import type { DeviceDef } from '../../store/types'
import { useHome } from '../../store/useHome'

/** Элемент управления устройством: вид зависит от типа устройства */
export function DeviceControl({ def }: { def: DeviceDef }) {
  const value = useHome((s) => s.devices[def.key])
  const setDevice = useHome((s) => s.setDevice)

  switch (def.kind) {
    case 'dimmer':
      return <Stepper label={def.label} value={Number(value)} min={0} max={100} step={10} size="md"
        format={(v) => formatValue(def.key, v)} onChange={(v) => setDevice(def.key, v)} />
    case 'climate':
      return <Stepper label={def.label} value={Number(value)} min={TEMP_LIMITS.min} max={TEMP_LIMITS.max} step={1} size="md"
        format={(v) => formatValue(def.key, v)} onChange={(v) => setDevice(def.key, v)} />
    case 'toggle':
      return <Switch showState aria-label={def.label} checked={Boolean(value)} onCheckedChange={(v) => setDevice(def.key, v)} />
    case 'rgb':
      return <Segmented label={def.label} value={String(value)} onChange={(v) => setDevice(def.key, v)}
        items={[{ value: 'off', label: 'Off' }, { value: 'low', label: 'Low' }, { value: 'high', label: 'High' }]} />
    case 'curtains':
      return <Segmented label={def.label} value={String(value)} onChange={(v) => setDevice(def.key, v)}
        items={[{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]} />
  }
}
