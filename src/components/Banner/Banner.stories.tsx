import type { Meta, StoryObj } from '@storybook/react-vite'
import { Banner } from './Banner'

const meta = { title: 'Status/Banner', component: Banner, parameters: { layout: 'padded' } } satisfies Meta<typeof Banner>
export default meta
type S = StoryObj<typeof meta>

export const Warning: S = { args: { children: 'A window is open: Living Room. Close it before turning on Away.' } }
export const Critical: S = { args: { tone: 'critical', children: 'Smoke detected in the Kitchen.' } }
