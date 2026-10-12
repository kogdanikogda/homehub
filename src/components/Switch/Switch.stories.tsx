import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from './Switch'

const meta = { title: 'Controls/Switch', component: Switch } satisfies Meta<typeof Switch>
export default meta
type S = StoryObj

const Demo = (p: { size?: 'md' | 'sm'; disabled?: boolean; start?: boolean }) => {
  const [on, setOn] = useState(p.start ?? false)
  return <Switch aria-label="Свет" checked={on} onCheckedChange={setOn} size={p.size} disabled={p.disabled} />
}
export const Off: S = { render: () => <Demo /> }
export const On: S = { render: () => <Demo start /> }
export const Small: S = { render: () => <Demo size="sm" start /> }
export const Disabled: S = { render: () => <Demo disabled /> }
