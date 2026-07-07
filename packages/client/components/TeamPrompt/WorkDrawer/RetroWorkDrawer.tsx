import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import type {RetroWorkDrawer_meeting$key} from '../../../__generated__/RetroWorkDrawer_meeting.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useSessionStorageState from '../../../hooks/useSessionStorageState'
import gcalLogo from '../../../styles/theme/images/graphics/google-calendar.svg'
import {cn} from '../../../ui/cn'
import AtlassianClientManager from '../../../utils/AtlassianClientManager'
import dndNoise from '../../../utils/dndNoise'
import GitHubClientManager from '../../../utils/GitHubClientManager'
import getNextSortOrder from '../../../utils/getNextSortOrder'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import GitHubSVG from '../../GitHubSVG'
import JiraServerSVG from '../../JiraServerSVG'
import JiraSVG from '../../JiraSVG'
import LinearSVG from '../../LinearSVG'
import ParabolLogoSVG from '../../ParabolLogoSVG'
import GCalIntegrationPanel from './GCalIntegrationPanel'
import GitHubIntegrationPanel from './GitHubIntegrationPanel'
import JiraIntegrationPanel from './JiraIntegrationPanel'
import JiraServerIntegrationPanel from './JiraServerIntegrationPanel'
import LinearIntegrationPanel from './LinearIntegrationPanel'
import ParabolTasksPanel from './ParabolTasksPanel'
import WorkDrawerConsumeContext from './WorkDrawerConsumeContext'

interface Props {
  meetingRef: RetroWorkDrawer_meeting$key
}

const RetroWorkDrawer = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroWorkDrawer_meeting on RetrospectiveMeeting {
        id
        teamId
        reflectionGroups {
          promptId
          sortOrder
          reflections {
            plaintextContent
          }
        }
        phases {
          ... on ReflectPhase {
            phaseType
            reflectPrompts {
              id
              question
              groupColor
            }
          }
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

  // Reflect phase stacks reflections descending by sortOrder, so the highest sortOrder is on top.
  const getNextReflectionSortOrder = (promptId: string | null) => {
    const promptGroups = meeting.reflectionGroups.filter((group) => group.promptId === promptId)
    return getNextSortOrder(promptGroups, dndNoise())
  }

  const reflectPrompts = meeting.phases.flatMap((phase) => phase.reflectPrompts ?? [])
  const getReflectPrompt = (promptId: string | null) => {
    const prompt = reflectPrompts.find(({id}) => id === promptId)
    return prompt ? {question: prompt.question, groupColor: prompt.groupColor} : null
  }

  const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim()
  const isReflectionAdded = (promptId: string | null, plaintext: string) => {
    const target = normalizeText(plaintext)
    if (!target) return false
    return meeting.reflectionGroups.some(
      (group) =>
        group.promptId === promptId &&
        group.reflections.some((r) => normalizeText(r.plaintextContent) === target)
    )
  }

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
    <WorkDrawerConsumeContext.Provider
      value={{mode: 'retro', getNextReflectionSortOrder, getReflectPrompt, isReflectionAdded}}
    >
      <div className='flex min-h-0 flex-1 flex-col bg-slate-50'>
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
                    ? 'bg-grape-700/10 text-grape-700'
                    : 'cursor-pointer text-slate-500 hover:bg-slate-200'
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

export default RetroWorkDrawer
