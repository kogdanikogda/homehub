import type { Meta, StoryObj } from '@storybook/react-vite'
import { PhoneFrame } from '../PhoneFrame/PhoneFrame'
import { AlarmPill, BackLink, ChangeRow, Note, PhoneBody, PhoneCard, PhoneHeader, RoomRow, SceneChip, SceneRow, StatTile, TabBar, WarningRow } from './Phone'

const meta = { title: 'Phone/Blocks', component: PhoneHeader } satisfies Meta<typeof PhoneHeader>
export default meta
type S = StoryObj

export const Blocks: S = {
  render: () => (
    <PhoneFrame>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <PhoneHeader title="Home" subtitle="Household · Marina" />
        <PhoneBody gap={12}>
          <PhoneCard title="Scene" aside={<AlarmPill on={false} />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <SceneChip icon="sun" name="General" selected />
              <SceneChip icon="film" name="Cinema" />
            </div>
          </PhoneCard>
          <div style={{ display: 'flex', gap: 8 }}>
            <StatTile icon="temp" value="21.8°" caption="Average" />
            <StatTile icon="window" value="2 open" caption="Windows" attention />
          </div>
          <WarningRow>Open: Living Room, Kids Room 1</WarningRow>
          <RoomRow name="Kids Room 1" sub="2 on · Window open" temp={22} priv onClick={() => {}} />
          <SceneRow icon="moon" name="Night" status="Not active" onClick={() => {}} />
          <BackLink label="Scenes" onClick={() => {}} />
          <ChangeRow label="Living Room · Main light" value="100%" />
          <Note>Only Alexey can edit scenes.</Note>
        </PhoneBody>
        <TabBar value="dashboard" onChange={() => {}} tabs={[{ id: 'dashboard', label: 'Dashboard', icon: 'dash' }, { id: 'rooms', label: 'Rooms', icon: 'rooms' }, { id: 'scenes', label: 'Scenes', icon: 'scenes' }]} />
      </div>
    </PhoneFrame>
  ),
}
