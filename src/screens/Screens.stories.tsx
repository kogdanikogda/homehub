import type { Meta, StoryObj } from '@storybook/react-vite'
import { PhoneFrame } from '../components/PhoneFrame/PhoneFrame'
import { TabletFrame } from '../components/TabletFrame/TabletFrame'
import { useHome } from '../store/useHome'
import { PhoneApp } from './phone/PhoneApp'
import { TabletApp } from './tablet/TabletApp'

const meta = { title: 'Screens/Apps', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type S = StoryObj

const box = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' } as const

export const WallTablet: S = {
  render: () => <div style={box}><TabletFrame><TabletApp /></TabletFrame></div>,
}
export const MarinaPhone: S = {
  render: () => <div style={box}><PhoneFrame label="Marina’s phone"><PhoneApp user="marina" /></PhoneFrame></div>,
}
export const AlexeyPhone: S = {
  render: () => <div style={box}><PhoneFrame label="Alexey’s phone"><PhoneApp user="alexey" /></PhoneFrame></div>,
}

/** Шторка Windows: открывается плиткой Windows на дашборде телефона */
export const WindowsSheet: S = {
  render: () => {
    useHome.getState().openWindows('marina')
    return <div style={box}><PhoneFrame label="Marina’s phone"><PhoneApp user="marina" /></PhoneFrame></div>
  },
}
/** Камера на входе: нажмите Talk — плашка «Talking…» и запись в журнале */
export const EntranceCamera: S = {
  render: () => <div style={box}><PhoneFrame label="Alexey’s phone"><PhoneApp user="alexey" /></PhoneFrame></div>,
}
