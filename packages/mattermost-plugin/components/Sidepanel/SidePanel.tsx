import {useState} from 'react'
import {useDispatch} from 'react-redux'
import ReactSelect from 'react-select'
import {openLinkTeamModal, openStartActivityModal} from '../../reducers'
import ActiveMeetings from './ActiveMeetings'
import LinkedTeams from './LinkedTeams'

const panels = {
  teams: {
    label: 'Linked Parabol Teams',
    panel: LinkedTeams,
    action: openLinkTeamModal,
    actionLabel: 'Link Team'
  },
  meetings: {
    label: 'Active Meetings',
    panel: ActiveMeetings,
    action: openStartActivityModal,
    actionLabel: 'Start Activity'
  }
} as const

const SidePanel = () => {
  const [activePanel, setActivePanel] = useState<keyof typeof panels>('teams')
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(panels[activePanel]?.action())
  }

  return (
    <div className='flex flex-col items-stretch overflow-y-auto px-2 py-4'>
      <div className='flex justify-between'>
        <ReactSelect
          className='cursor-pointer'
          isSearchable={false}
          value={{value: activePanel, label: panels[activePanel].label}}
          options={Object.entries(panels).map(([value, {label}]) => ({value, label})) as any}
          onChange={(newValue) => {
            newValue && setActivePanel(newValue.value)
          }}
          components={{
            Control: ({children, innerRef, innerProps}) => (
              <div ref={innerRef} {...innerProps} className='flex font-bold'>
                {children}
              </div>
            ),
            IndicatorSeparator: () => null
          }}
        />
        <button className='btn btn-primary' onClick={handleClick}>
          {panels[activePanel]?.actionLabel}
        </button>
      </div>
      {panels[activePanel]?.panel()}
    </div>
  )
}

export default SidePanel
