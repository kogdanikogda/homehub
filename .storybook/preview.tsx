import '@fontsource-variable/inter'
import '../src/styles/global.css'
import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'app', values: [{ name: 'app', value: '#0b0b0b' }] },
    a11y: { test: 'todo' },
  },
}
export default preview
