import graphql from 'babel-plugin-relay/macro'
import {useEffect, useMemo} from 'react'
import {useFragment} from 'react-relay'
import {AutoAwesome} from '~/ui/icons'
import type {TeamPromptWorkDrawer_meeting$key} from '../../__generated__/TeamPromptWorkDrawer_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useSessionStorageState from '../../hooks/useSessionStorageState'
import {getConnectProvider} from '../../integrations/platform/findIntegrationService'
import gcalLogo from '../../styles/theme/images/graphics/google-calendar.svg'
import {BottomSheetHeader} from '../../ui/BottomSheet/BottomSheetHeader'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import GitHubSVG from '../GitHubSVG'
import GitLabSVG from '../GitLabSVG'
import JiraServerSVG from '../JiraServerSVG'
import JiraSVG from '../JiraSVG'
import LinearSVG from '../LinearSVG'
import ParabolLogoSVG from '../ParabolLogoSVG'
import {useTeamPromptComposerApi} from './structured/TeamPromptComposerApiContext'
import GCalIntegrationPanel from './WorkDrawer/GCalIntegrationPanel'
import GitHubIntegrationPanel from './WorkDrawer/GitHubIntegrationPanel'
import GitLabIntegrationPanel from './WorkDrawer/GitLabIntegrationPanel'
import InspirationPresentationContext, {
  type InspirationVariant
} from './WorkDrawer/InspirationPresentationContext'
import JiraIntegrationPanel from './WorkDrawer/JiraIntegrationPanel'
import JiraServerIntegrationPanel from './WorkDrawer/JiraServerIntegrationPanel'
import LinearIntegrationPanel from './WorkDrawer/LinearIntegrationPanel'
import ParabolTasksPanel from './WorkDrawer/ParabolTasksPanel'
import WorkDrawerConsumeContext from './WorkDrawer/WorkDrawerConsumeContext'
import WorkDrawerServiceTabs from './WorkDrawer/WorkDrawerServiceTabs'

interface Props {
  meetingRef: TeamPromptWorkDrawer_meeting$key
  variant?: InspirationVariant
  onClose?: () => void
  onAdded?: () => void
}

const TeamPromptWorkDrawer = (props: Props) => {
  const {meetingRef, variant = 'drawer', onClose, onAdded} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptWorkDrawer_meeting on TeamPromptMeeting {
        id
        teamId
        prompts {
          id
          question
          groupColor
        }
        ...ParabolTasksPanel_meeting
        ...GitHubIntegrationPanel_meeting
        ...GitLabIntegrationPanel_meeting
        ...JiraIntegrationPanel_meeting
        ...GCalIntegrationPanel_meeting
        ...JiraServerIntegrationPanel_meeting
        ...LinearIntegrationPanel_meeting
        viewerMeetingMember {
          teamMember {
            teamId
            services {
              ...findIntegrationService_cloudProvider @relay(mask: false)
            }
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
              gitlab {
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
  const composer = useTeamPromptComposerApi()
  const hasJiraServer =
    !!meeting.viewerMeetingMember?.teamMember?.integrations.jiraServer?.sharedProviders?.length
  const hasLinear =
    !!meeting.viewerMeetingMember?.teamMember?.integrations.linear?.cloudProvider?.id
  const hasGCal = !!meeting.viewerMeetingMember?.teamMember?.integrations.gcal?.cloudProvider?.id
  const hasGitLab =
    !!meeting.viewerMeetingMember?.teamMember?.integrations.gitlab?.cloudProvider?.id
  const services = meeting.viewerMeetingMember?.teamMember?.services ?? []
  const hasGitHub = !!getConnectProvider(services, 'github')
  const hasJira = !!getConnectProvider(services, 'jira')

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
    ...(hasGitHub
      ? [
          {
            icon: <GitHubSVG className='dark:[&_path]:fill-white' />,
            service: 'github',
            label: 'GitHub',
            Component: GitHubIntegrationPanel
          }
        ]
      : []),
    ...(hasGitLab
      ? [
          {
            icon: <GitLabSVG />,
            service: 'gitlab',
            label: 'GitLab',
            Component: GitLabIntegrationPanel
          }
        ]
      : []),
    ...(hasJira
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
            icon: <LinearSVG className='dark:[&_path]:fill-white' />,
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
  const presentation = useMemo(() => ({variant, onAdded}), [variant, onAdded])

  const onSelectTab = (idx: number) => {
    const tab = baseTabs[idx]
    if (!tab) return
    SendClientSideEvent(atmosphere, 'Your Work Integration Clicked', {
      teamId: meeting.teamId,
      meetingId: meeting.id,
      service: tab.service
    })
    setActiveService(tab.service)
  }
  const serviceTabs = (
    <WorkDrawerServiceTabs
      tabs={baseTabs}
      activeIdx={activeIdx}
      variant={variant}
      onSelect={onSelectTab}
    />
  )

  return (
    <InspirationPresentationContext.Provider value={presentation}>
      <WorkDrawerConsumeContext.Provider
        value={{mode: 'teamPrompt', composer, prompts: meeting.prompts}}
      >
        <div className='flex min-h-0 flex-1 flex-col'>
          {variant === 'sheet' ? (
            <BottomSheetHeader
              icon={<AutoAwesome className='h-[22px] w-[22px]' />}
              title='Inspiration'
              onClose={() => onClose?.()}
            >
              {serviceTabs}
            </BottomSheetHeader>
          ) : (
            <div className='flex justify-center pt-3 pb-2'>{serviceTabs}</div>
          )}
          <Component meetingRef={meeting} />
        </div>
      </WorkDrawerConsumeContext.Provider>
    </InspirationPresentationContext.Provider>
  )
}

export default TeamPromptWorkDrawer
