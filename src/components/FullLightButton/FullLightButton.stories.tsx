import type { Meta, StoryObj } from '@storybook/react-vite'
import { FullLightButton } from './FullLightButton'

const meta = { title: 'Controls/FullLightButton', component: FullLightButton, args: { state: 'full', onFull: () => {}, onBack: () => {} } } satisfies Meta<typeof FullLightButton>
export default meta
type S = StoryObj<typeof meta>

export const Full: S = {}
export const Back: S = { args: { state: 'back' } }
export const Phone: S = { args: { size: 'md' } }
export const PhoneBack: S = { args: { size: 'md', state: 'back' } }
export const Compact: S = { args: { block: false } }
