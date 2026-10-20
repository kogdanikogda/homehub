import { Segmented } from '../../components/Segmented/Segmented'
import { Stepper } from '../../components/Stepper/Stepper'
import { Switch } from '../../components/Switch/Switch'
import { formatValue } from '../../store/logic'
import type { DeviceDef, DeviceId } from '../../store/types'
import { useHome } from '../../store/useHome'
import { t } from '../../i18n'

/** Элемент управления устройством: вид зависит от типа устройства */
export function DeviceControl({ def, platform = 'tablet', by = 'tablet' }: { def: DeviceDef; platform?: 'tablet' | 'phone'; by?: DeviceId }) {
  const sz = platform === 'phone' ? 'sm' : 'md'
  const value = useHome((s) => s.devices[def.key])
  const setDevice = useHome((s) => s.setDevice)
  const limits = useHome((s) => s.tempLimits)

  switch (def.kind) {
    case 'dimmer':
      return <Stepper label={def.label} value={Number(value)} min={0} max={100} step={10} size={sz}
        format={(v) => formatValue(def.key, v)} onChange={(v) => setDevice(def.key, v, by)} />
    case 'climate':
      return <Stepper label={def.label} value={Number(value)} min={limits.min} max={limits.max} step={1} size={sz}
        format={(v) => formatValue(def.key, v)} onChange={(v) => setDevice(def.key, v, by)} />
    case 'toggle':
      return <Switch showState={platform === 'tablet'} size={sz} aria-label={def.label} checked={Boolean(value)} onCheckedChange={(v) => setDevice(def.key, v, by)} />
    case 'rgb':
      return <Segmented platform={platform} label={def.label} value={String(value)} onChange={(v) => setDevice(def.key, v, by)}
        items={[{ value: 'off', label: t('Off') }, { value: 'low', label: t('Low') }, { value: 'high', label: t('High') }]} />
    case 'curtains':
      return <Segmented platform={platform} label={def.label} value={String(value)} onChange={(v) => setDevice(def.key, v, by)}
        items={[{ value: 'open', label: t('Open') }, { value: 'closed', label: t('Closed') }]} />
  }
}
