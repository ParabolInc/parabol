import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useDispatch} from 'react-redux'
import {useSubscription} from 'react-relay'
import ReactSelect from 'react-select'
import {SidePanel_teamSubscription} from '../../__generated__/SidePanel_teamSubscription.graphql'
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
  useSubscription<SidePanel_teamSubscription>({
    subscription: graphql`
      subscription SidePanel_teamSubscription {
        teamSubscription {
          fieldName
          StartCheckInSuccess {
            ...useStartMeeting_checkIn @relay(mask: false)
          }
          StartRetrospectiveSuccess {
            ...useStartMeeting_retrospective @relay(mask: false)
          }
          StartSprintPokerSuccess {
            ...useStartMeeting_sprintPoker @relay(mask: false)
          }
          StartTeamPromptSuccess {
            ...useStartMeeting_teamPrompt @relay(mask: false)
          }
        }
      }
    `,
    variables: {}
    /*
    probably not needed if the subscription requests enough data
    onNext: (data) => {
      if (!data?.teamSubscription) return
      switch (data.teamSubscription.fieldName) {
        case 'StartCheckInSuccess':
          break
        case 'StartRetrospectiveSuccess':
          break
        case 'StartSprintPokerSuccess':
          break
        case 'StartTeamPromptSuccess':
          break
      }
    }
    */
  })

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
