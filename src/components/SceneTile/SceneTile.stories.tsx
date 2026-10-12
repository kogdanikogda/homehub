import type { Meta, StoryObj } from '@storybook/react-vite'
import { SceneTile } from './SceneTile'

const meta = { title: 'Cards/SceneTile', component: SceneTile, args: { name: 'General', icon: 'sun' } } satisfies Meta<typeof SceneTile>
export default meta
type S = StoryObj<typeof meta>

export const Idle: S = { args: { name: 'Cinema', icon: 'film' } }
export const Active: S = { args: { state: 'active' } }
export const Modified: S = { args: { name: 'Cinema', icon: 'film', state: 'modified' } }
export const Unavailable: S = { args: { state: 'unavailable' } }
