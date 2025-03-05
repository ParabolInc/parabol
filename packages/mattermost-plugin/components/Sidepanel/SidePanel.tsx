import graphql from 'babel-plugin-relay/macro'
import {useEffect, useMemo, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useLazyLoadQuery} from 'react-relay'
import ReactSelect from 'react-select'
import {SidePanelQuery} from '../../__generated__/SidePanelQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
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
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<SidePanelQuery>(
    graphql`
      query SidePanelQuery {
        viewer {
          teams {
            id
            viewerTeamMember {
              id
              integrations {
                mattermost {
                  linkedChannels
                }
              }
            }
          }
        }
      }
    `,
    {}
  )
  const linkedTeams = useMemo(() => {
    const {viewer} = data
    return viewer.teams.filter(
      (team) =>
        channel &&
        team.viewerTeamMember?.integrations.mattermost.linkedChannels.includes(channel.id)
    )
  }, [data, channel])

  const [activePanel, setActivePanel] = useState<keyof typeof panels>('meetings')
  useEffect(() => {
    if (linkedTeams && linkedTeams.length === 0) {
      setActivePanel('teams')
    }
  }, [linkedTeams])

  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(panels[activePanel]?.action())
  }

  return (
    <div className='flex h-full flex-col items-stretch overflow-y-auto px-2 py-4'>
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
