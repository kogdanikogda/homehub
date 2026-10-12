import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip, Tag } from './Chip'

const meta = { title: 'Status/Chip', component: Chip, args: { children: 'View only' } } satisfies Meta<typeof Chip>
export default meta
type S = StoryObj<typeof meta>

export const Neutral: S = { args: { icon: 'lock' } }
export const Accent: S = { args: { tone: 'accent', icon: 'sun', children: 'General controls 4' } }
export const Warning: S = { args: { tone: 'warning', size: 'xs', children: 'Modified · 2 changes' } }
export const Success: S = { args: { tone: 'success', dot: true, children: 'Online' } }
export const Large: S = { args: { size: 'lg', children: 'Offline' } }
export const Tags: S = { render: () => <div style={{ display: 'flex', gap: 8 }}><Tag>Private</Tag><Tag tone="warning">Changed</Tag></div> }
