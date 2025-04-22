import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import SwipeableViews from 'react-swipeable-views'
import {ScopePhaseArea_meeting$key} from '~/__generated__/ScopePhaseArea_meeting.graphql'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import GitHubClientManager from '../utils/GitHubClientManager'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import GitHubSVG from './GitHubSVG'
import GitLabSVG from './GitLabSVG'
import JiraSVG from './JiraSVG'
import JiraServerSVG from './JiraServerSVG'
import LinearSVG from './LinearSVG'
import ParabolLogoSVG from './ParabolLogoSVG'
import ScopePhaseAreaAzureDevOps from './ScopePhaseAreaAzureDevOps'
import ScopePhaseAreaGitHub from './ScopePhaseAreaGitHub'
import ScopePhaseAreaGitLab from './ScopePhaseAreaGitLab'
import ScopePhaseAreaJira from './ScopePhaseAreaJira'
import ScopePhaseAreaJiraServer from './ScopePhaseAreaJiraServer'
import ScopePhaseAreaLinear from './ScopePhaseAreaLinear'
import ScopePhaseAreaParabolScoping from './ScopePhaseAreaParabolScoping'
import Tab from './Tab/Tab'
import Tabs from './Tabs/Tabs'

interface Props {
  meeting: ScopePhaseArea_meeting$key
}

const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', height: '100%'}

const ScopePhaseArea = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseArea_meeting on PokerMeeting {
        ...StageTimerDisplay_meeting
        ...StageTimerControl_meeting
        ...ScopePhaseAreaGitHub_meeting
        ...ScopePhaseAreaGitLab_meeting
        ...ScopePhaseAreaJira_meeting
        ...ScopePhaseAreaJiraServer_meeting
        ...ScopePhaseAreaParabolScoping_meeting
        ...ScopePhaseAreaAzureDevOps_meeting
        ...ScopePhaseAreaLinear_meeting
        endedAt
        localPhase {
          ...ScopePhaseArea_phase @relay(mask: false)
        }
        localStage {
          isComplete
        }
        phases {
          ...ScopePhaseArea_phase @relay(mask: false)
        }
        showSidebar
        viewerMeetingMember {
          teamMember {
            integrations {
              gitlab {
                cloudProvider {
                  clientId
                }
                sharedProviders {
                  clientId
                }
              }
              jiraServer {
                sharedProviders {
                  id
                }
              }
              azureDevOps {
                cloudProvider {
                  id
                }
                sharedProviders {
                  id
                }
              }
              linear {
                cloudProvider {
                  clientId
                }
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {viewerMeetingMember} = meeting
  const gitlabIntegration = viewerMeetingMember?.teamMember.integrations.gitlab
  const jiraServerIntegration = viewerMeetingMember?.teamMember.integrations.jiraServer
  const azureDevOpsIntegration = viewerMeetingMember?.teamMember.integrations.azureDevOps
  const linearIntegration = viewerMeetingMember?.teamMember.integrations.linear
  const allowAzureDevOps =
    !!azureDevOpsIntegration?.sharedProviders.length || !!azureDevOpsIntegration?.cloudProvider
  const isGitLabProviderAvailable = !!(
    gitlabIntegration?.cloudProvider?.clientId || gitlabIntegration?.sharedProviders.length
  )
  const allowJiraServer = !!jiraServerIntegration?.sharedProviders.length
  const isLinearProviderAvailable = !!linearIntegration?.cloudProvider?.clientId

  const baseTabs = [
    {
      icon: <GitHubSVG />,
      label: 'GitHub',
      allow: GitHubClientManager.isAvailable,
      Component: ScopePhaseAreaGitHub
    },
    {
      icon: <JiraSVG />,
      label: 'Jira',
      allow: AtlassianClientManager.isAvailable,
      Component: ScopePhaseAreaJira
    },
    {
      icon: <ParabolLogoSVG />,
      label: 'Parabol',
      allow: true,
      Component: ScopePhaseAreaParabolScoping
    },
    {
      icon: <JiraServerSVG />,
      label: 'Jira Data Center',
      allow: allowJiraServer,
      Component: ScopePhaseAreaJiraServer
    },
    {
      icon: <GitLabSVG />,
      label: 'GitLab',
      allow: isGitLabProviderAvailable,
      Component: ScopePhaseAreaGitLab
    },
    {
      icon: <AzureDevOpsSVG />,
      label: 'Azure DevOps',
      allow: allowAzureDevOps,
      Component: ScopePhaseAreaAzureDevOps
    },
    {
      icon: <LinearSVG />,
      label: 'Linear',
      allow: isLinearProviderAvailable,
      Component: ScopePhaseAreaLinear
    }
  ] as const

  const tabs = baseTabs.filter(({allow}) => allow)
  const [activeIdx, setActiveIdx] = useState(() => {
    const favoriteService = window.localStorage.getItem('favoriteService') || 'Jira'
    const idx = tabs.findIndex((tab) => tab.label === favoriteService)
    return idx === -1 ? 1 : idx
  })

  const isTabActive = (label: (typeof baseTabs)[number]['label']) => {
    return activeIdx === tabs.findIndex((tab) => tab.label === label)
  }

  const selectIdx = (idx: number) => {
    setActiveIdx(idx)
    const service = tabs[idx]?.label ?? 'Jira'
    window.localStorage.setItem('favoriteService', service)
  }

  const onChangeIdx = (idx: number, _fromIdx: number, props: {reason: string}) => {
    //very buggy behavior, probably linked to the vertical scrolling.
    // to repro, go from team > org > team > org by clicking tabs & see this this get called for who knows why
    if (props.reason === 'focus') return
    selectIdx(idx)
  }

  const gotoParabol = () => {
    setActiveIdx(2)
  }

  return (
    <div
      className={`flex flex-col rounded-lg bg-white ${isDesktop ? '' : 'mx-auto'} ${isDesktop ? 'w-4/5' : 'w-[calc(100%-16px)]'} h-[70%] max-w-[1040px] shadow-md`}
    >
      <div className='scrollbar-thin scrollbar-thumb-gray-400 scrollbar-thumb-rounded max-w-full overflow-hidden overflow-x-auto shadow-[inset_0_-1px_0_#C3C0D8]'>
        <Tabs activeIdx={activeIdx}>
          {tabs.map((tab, idx) => (
            <Tab
              key={tab.label}
              label={
                <div className='flex min-w-20 items-center justify-center whitespace-nowrap'>
                  <div className='mx-1 h-6 w-6'>{tab.icon}</div>
                  {tab.label}
                </div>
              }
              onClick={() => selectIdx(idx)}
            />
          ))}
        </Tabs>
      </div>
      <SwipeableViews
        enableMouseEvents={false} // disable because this works even if a modal is on top of it
        index={activeIdx}
        onChangeIndex={onChangeIdx as any}
        containerStyle={containerStyle}
        style={innerStyle}
      >
        {/* swipeable views won't ignore null children: https://github.com/oliviertassinari/react-swipeable-views/issues/271 */}
        {tabs.map(({label, Component}) => (
          <div className='relative flex h-full flex-col overflow-hidden' key={label}>
            <Component
              meetingRef={meeting}
              isActive={isTabActive(label)}
              gotoParabol={gotoParabol}
            />
          </div>
        ))}
      </SwipeableViews>
    </div>
  )
}

graphql`
  fragment ScopePhaseArea_phase on GenericMeetingPhase {
    id
  }
`

export default ScopePhaseArea
