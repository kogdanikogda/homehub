import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast } from './Toast'

const meta = { title: 'Status/Toast', component: Toast } satisfies Meta<typeof Toast>
export default meta
export const Default: StoryObj<typeof meta> = { args: { children: 'Kitchen light turned on' } }
