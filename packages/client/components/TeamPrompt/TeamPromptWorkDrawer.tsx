import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptWorkDrawer_meeting$key} from '../../__generated__/TeamPromptWorkDrawer_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useSessionStorageState from '../../hooks/useSessionStorageState'
import gcalLogo from '../../styles/theme/images/graphics/google-calendar.svg'
import {cn} from '../../ui/cn'
import AtlassianClientManager from '../../utils/AtlassianClientManager'
import GitHubClientManager from '../../utils/GitHubClientManager'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import GitHubSVG from '../GitHubSVG'
import JiraServerSVG from '../JiraServerSVG'
import JiraSVG from '../JiraSVG'
import LinearSVG from '../LinearSVG'
import ParabolLogoSVG from '../ParabolLogoSVG'
import GCalIntegrationPanel from './WorkDrawer/GCalIntegrationPanel'
import GitHubIntegrationPanel from './WorkDrawer/GitHubIntegrationPanel'
import JiraIntegrationPanel from './WorkDrawer/JiraIntegrationPanel'
import JiraServerIntegrationPanel from './WorkDrawer/JiraServerIntegrationPanel'
import LinearIntegrationPanel from './WorkDrawer/LinearIntegrationPanel'
import ParabolTasksPanel from './WorkDrawer/ParabolTasksPanel'
import WorkDrawerConsumeContext from './WorkDrawer/WorkDrawerConsumeContext'

interface Props {
  meetingRef: TeamPromptWorkDrawer_meeting$key
}

const TeamPromptWorkDrawer = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptWorkDrawer_meeting on TeamPromptMeeting {
        id
        teamId
        responses {
          id
          userId
          content
          plaintextContent
        }
        ...ParabolTasksPanel_meeting
        ...GitHubIntegrationPanel_meeting
        ...JiraIntegrationPanel_meeting
        ...GCalIntegrationPanel_meeting
        ...JiraServerIntegrationPanel_meeting
        ...LinearIntegrationPanel_meeting
        viewerMeetingMember {
          teamMember {
            teamId
            integrations {
              jiraServer {
                sharedProviders {
                  id
                }
              }
              gcal {
                cloudProvider {
                  id
                }
              }
              linear {
                cloudProvider {
                  id
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const viewerResponse = meeting.responses.find((response) => response.userId === viewerId) ?? null
  const hasJiraServer =
    !!meeting.viewerMeetingMember?.teamMember?.integrations.jiraServer?.sharedProviders?.length
  const hasLinear =
    !!meeting.viewerMeetingMember?.teamMember?.integrations.linear?.cloudProvider?.id
  const hasGCal = !!meeting.viewerMeetingMember?.teamMember?.integrations.gcal?.cloudProvider?.id

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Impression', {
      teamId: meeting.teamId,
      meetingId: meeting.id
    })
  }, [])

  const baseTabs = [
    {
      icon: <ParabolLogoSVG />,
      service: 'PARABOL',
      label: 'Parabol',
      Component: ParabolTasksPanel
    },
    ...(hasJiraServer
      ? [
          {
            icon: <JiraServerSVG />,
            service: 'jiraServer',
            label: 'Jira Data Center',
            Component: JiraServerIntegrationPanel
          }
        ]
      : []),
    ...(GitHubClientManager.isAvailable
      ? [
          {
            icon: <GitHubSVG />,
            service: 'github',
            label: 'GitHub',
            Component: GitHubIntegrationPanel
          }
        ]
      : []),
    ...(AtlassianClientManager.isAvailable
      ? [
          {
            icon: <JiraSVG />,
            service: 'jira',
            label: 'Jira',
            Component: JiraIntegrationPanel
          }
        ]
      : []),
    ...(hasLinear
      ? [
          {
            icon: <LinearSVG />,
            service: 'linear',
            label: 'Linear',
            Component: LinearIntegrationPanel
          }
        ]
      : []),
    ...(hasGCal
      ? [
          {
            icon: <img className='h-6 w-6' src={gcalLogo} />,
            service: 'gcal',
            label: 'Google Calendar',
            Component: GCalIntegrationPanel
          }
        ]
      : [])
  ] as const

  const [activeService, setActiveService] = useSessionStorageState<string>(
    `Inspiration:tab:${meeting.id}`,
    'PARABOL'
  )
  const activeIdx = Math.max(
    0,
    baseTabs.findIndex((tab) => tab.service === activeService)
  )

  const {Component} = baseTabs[activeIdx]!

  return (
    <WorkDrawerConsumeContext.Provider value={{mode: 'teamPrompt', viewerResponse}}>
      <div className='flex min-h-0 flex-1 flex-col bg-surface-well'>
        <div className='flex justify-center pt-3 pb-2'>
          <div className='flex gap-1'>
            {baseTabs.map((tab, idx) => (
              <button
                key={tab.label}
                title={tab.label}
                onClick={() => {
                  SendClientSideEvent(atmosphere, 'Your Work Integration Clicked', {
                    teamId: meeting.teamId,
                    meetingId: meeting.id,
                    service: baseTabs[idx]?.service
                  })
                  setActiveService(tab.service)
                }}
                className={cn(
                  'flex h-10 w-10 appearance-none items-center justify-center rounded-full transition-colors',
                  idx === activeIdx
                    ? 'bg-accent-active/10 text-accent-active'
                    : 'cursor-pointer text-fg-muted hover:bg-surface-raised'
                )}
              >
                {tab.icon}
              </button>
            ))}
          </div>
        </div>
        <Component meetingRef={meeting} />
      </div>
    </WorkDrawerConsumeContext.Provider>
  )
}

export default TeamPromptWorkDrawer
