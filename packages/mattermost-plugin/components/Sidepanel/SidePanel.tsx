import {Forum, Group} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import Tab from 'parabol-client/components/Tab/Tab'
import {Suspense, useEffect, useMemo, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import Tabs from '~/components/Tabs/Tabs'
import {SidePanelQuery} from '../../__generated__/SidePanelQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {openLinkTeamModal, openStartActivityModal} from '../../reducers'
import ActiveMeetings from './ActiveMeetings'
import LinkedTeams from './LinkedTeams'

const panels = {
  teams: {
    label: 'Teams',
    icon: <Group />,
    panel: LinkedTeams,
    action: openLinkTeamModal,
    actionLabel: 'Link Team'
  },
  meetings: {
    label: 'Activies',
    icon: <Forum />,
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

  return (
    <div className='flex h-full flex-col items-stretch overflow-hidden px-2'>
      <Tabs
        activeIdx={Object.keys(panels).indexOf(activePanel)}
        className='w-full max-w-none border-b border-slate-300'
      >
        {Object.entries(panels).map(([key, {icon, label}]) => (
          <Tab
            key={key}
            label={
              <div className='flex items-center'>
                {icon}
                <div className='px-1'>{label}</div>
              </div>
            }
            className='p-2'
            onClick={() => setActivePanel(key as any)}
          />
        ))}
      </Tabs>
      <Suspense fallback={null}>{panels[activePanel]?.panel()}</Suspense>
    </div>
  )
}

export default SidePanel
