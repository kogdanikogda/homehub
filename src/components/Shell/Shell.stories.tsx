import type { Meta, StoryObj } from '@storybook/react-vite'
import { NavItem, HeaderStat } from './NavItem'

const meta = { title: 'Shell/Tablet', component: NavItem } satisfies Meta<typeof NavItem>
export default meta
type S = StoryObj

export const Nav: S = { render: () => <div style={{ display: 'flex', gap: 8 }}><NavItem icon="dash" label="Dashboard" selected /><NavItem icon="rooms" label="Rooms" /><NavItem icon="scenes" label="Scenes" /></div> }
export const Stats: S = { render: () => <div style={{ display: 'flex', gap: 8 }}><HeaderStat icon="temp" label="Average temperature" value="21.8°C" /><HeaderStat icon="window" label="Windows" value="1 open" attention /></div> }
