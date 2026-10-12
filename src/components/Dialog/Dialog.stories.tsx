import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dialog } from './Dialog'
import { Button } from '../Button/Button'

const meta = { title: 'Overlays/Dialog', component: Dialog, parameters: { layout: 'centered' } } satisfies Meta<typeof Dialog>
export default meta

export const Confirm: StoryObj<typeof meta> = {
  args: { open: false, onOpenChange: () => {}, title: 'Turn on Away?' },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog {...args} open={open} onOpenChange={setOpen} primary={{ label: 'Turn on Away', onClick: () => setOpen(false) }}
          lead="Lights will turn off and the alarm will arm in 60 seconds." />
      </>
    )
  },
}
