import {useState} from 'react'
import ReactSelect from 'react-select'
import ActiveMeetings from './ActiveMeetings'
import LinkedTeams from './LinkedTeams'

const panels = {
  teams: 'Linked Parabol Teams',
  meetings: 'Active Meetings'
} as const

const optionify = <T extends Record<string, string>>(obj: T) =>
  Object.entries(obj).map(([value, label]) => ({value, label})) as {
    value: keyof T
    label: T[keyof T]
  }[]

const SidePanel = () => {
  const [activePanel, setActivePanel] = useState<keyof typeof panels>('teams')

  return (
    <div className='flex flex-col items-stretch overflow-y-auto px-2 py-4'>
      <ReactSelect
        value={{value: activePanel, label: panels[activePanel]}}
        options={optionify(panels)}
        onChange={(newValue) => {
          newValue && setActivePanel(newValue.value)
        }}
      />
      {activePanel === 'teams' && <LinkedTeams />}
      {activePanel === 'meetings' && <ActiveMeetings />}
    </div>
  )
}

export default SidePanel
