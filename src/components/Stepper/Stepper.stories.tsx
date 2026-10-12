import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stepper } from './Stepper'

const meta = { title: 'Controls/Stepper', component: Stepper } satisfies Meta<typeof Stepper>
export default meta
type S = StoryObj

const Demo = ({ size }: { size: 'sm' | 'md' }) => {
  const [v, setV] = useState(80)
  return <Stepper label="Яркость" value={v} onChange={setV} size={size} />
}
export const Tablet: S = { render: () => <Demo size="md" /> }
export const Phone: S = { render: () => <Demo size="sm" /> }
