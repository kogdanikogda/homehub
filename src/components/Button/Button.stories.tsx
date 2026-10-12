import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = { title: 'Controls/Button', component: Button, args: { children: 'Turn on Away' } } satisfies Meta<typeof Button>
export default meta
type S = StoryObj<typeof meta>

export const Primary: S = {}
export const Secondary: S = { args: { variant: 'secondary', children: 'Cancel' } }
export const Disabled: S = { args: { disabled: true, children: 'Activate' } }
export const WithIcon: S = { args: { icon: 'check', children: 'Active' } }
export const AlarmInverse: S = { args: { variant: 'inverse', size: 'xl', icon: 'lock', children: 'Turn off alarm (PIN)' } }
export const Phone: S = { args: { size: 'md', icon: 'plus', children: 'Add device' } }
export const PhoneSmall: S = { args: { size: 'sm', children: 'Unlock' } }
