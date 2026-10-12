import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DeviceRow } from './DeviceRow'
import { Stepper } from '../Stepper/Stepper'
import { Switch } from '../Switch/Switch'
import { Segmented } from '../Segmented/Segmented'

const meta = { title: 'Rows/DeviceRow', component: DeviceRow, parameters: { layout: 'padded' } } satisfies Meta<typeof DeviceRow>
export default meta
type S = StoryObj

const WithStepper = ({ platform }: { platform: 'tablet' | 'phone' }) => {
  const [v, setV] = useState(80)
  return <DeviceRow platform={platform} icon="light" label="Main light" inScene changed
    control={<Stepper label="Яркость" value={v} onChange={setV} size={platform === 'tablet' ? 'md' : 'sm'} />} />
}
export const TabletStepper: S = { render: () => <div style={{ width: 372 }}><WithStepper platform="tablet" /></div> }
export const PhoneStepper: S = { render: () => <div style={{ width: 338 }}><WithStepper platform="phone" /></div> }

export const SwitchControl: S = {
  render: () => {
    const [on, setOn] = useState(false)
    return <div style={{ width: 372 }}><DeviceRow icon="tv" label="TV" control={<Switch aria-label="TV" checked={on} onCheckedChange={setOn} />} /></div>
  },
}
export const SegmentedControl: S = {
  render: () => {
    const [v, setV] = useState('low')
    return <div style={{ width: 372 }}><DeviceRow icon="temp" label="Heating" control={
      <Segmented label="Heating" value={v} onChange={setV} items={[{ value: 'off', label: 'Off' }, { value: 'low', label: 'Low' }, { value: 'high', label: 'High' }]} />} /></div>
  },
}
export const Unavailable: S = { render: () => <div style={{ width: 372 }}><DeviceRow icon="light" label="Main light" unavailable status="Unavailable" /></div> }
