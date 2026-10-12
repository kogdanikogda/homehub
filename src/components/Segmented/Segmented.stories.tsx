import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Segmented } from './Segmented'

const meta = { title: 'Controls/Segmented', component: Segmented } satisfies Meta<typeof Segmented>
export default meta
type S = StoryObj

const Demo = ({ platform }: { platform: 'tablet' | 'phone' }) => {
  const [v, setV] = useState('off')
  return (
    <Segmented label="Мощность" platform={platform} value={v} onChange={setV}
      items={[{ value: 'off', label: 'Off' }, { value: 'low', label: 'Low' }, { value: 'high', label: 'High' }]} />
  )
}
export const Tablet: S = { render: () => <Demo platform="tablet" /> }
export const Phone: S = { render: () => <Demo platform="phone" /> }
