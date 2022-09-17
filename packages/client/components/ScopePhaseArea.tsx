import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import SwipeableViews from 'react-swipeable-views'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {ScopePhaseArea_meeting} from '~/__generated__/ScopePhaseArea_meeting.graphql'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import AzureDevOpsSVG from './AzureDevOpsSVG'
import GitHubSVG from './GitHubSVG'
import GitLabSVG from './GitLabSVG'
import Icon from './Icon'
import JiraServerSVG from './JiraServerSVG'
import JiraSVG from './JiraSVG'
import ParabolLogoSVG from './ParabolLogoSVG'
import ScopePhaseAreaAzureDevOps from './ScopePhaseAreaAzureDevOps'
import ScopePhaseAreaGitHub from './ScopePhaseAreaGitHub'
import ScopePhaseAreaGitLab from './ScopePhaseAreaGitLab'
import ScopePhaseAreaJira from './ScopePhaseAreaJira'
import ScopePhaseAreaJiraServer from './ScopePhaseAreaJiraServer'
import ScopePhaseAreaParabolScoping from './ScopePhaseAreaParabolScoping'
import Tab from './Tab/Tab'
import Tabs from './Tabs/Tabs'

interface Props {
  meeting: ScopePhaseArea_meeting
}

const ScopingArea = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  background: '#fff',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  margin: isDesktop ? undefined : '0 auto',
  width: isDesktop ? '80%' : 'calc(100% - 16px)',
  maxWidth: 1040,
  height: '70%',
  boxShadow: Elevation.Z3
}))

const StyledTabsBar = styled(Tabs)({
  boxShadow: `inset 0 -1px 0 ${PALETTE.SLATE_300}`,
  maxWidth: '100%'
})

const TabIcon = styled(Icon)({
  padding: '0px 4px'
})

const TabLabel = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 80,
  whiteSpace: 'pre-wrap'
})

const TabContents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  overflow: 'hidden'
})

const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', height: '100%'}

const ScopePhaseArea = (props: Props) => {
  const {meeting} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {viewerMeetingMember} = meeting
  const featureFlags = viewerMeetingMember?.user.featureFlags
  const gitlabIntegration = viewerMeetingMember?.teamMember.integrations.gitlab
  const jiraServerIntegration = viewerMeetingMember?.teamMember.integrations.jiraServer
  const azureDevOpsIntegration = viewerMeetingMember?.teamMember.integrations.azureDevOps
  const allowAzureDevOps =
    (!!azureDevOpsIntegration?.sharedProviders.length || !!azureDevOpsIntegration?.cloudProvider) &&
    featureFlags?.azureDevOps
  const isGitLabProviderAvailable = !!(
    gitlabIntegration?.cloudProvider?.clientId || gitlabIntegration?.sharedProviders.length
  )
  const allowJiraServer = !!jiraServerIntegration?.sharedProviders.length

  const baseTabs = [
    {icon: <GitHubSVG />, label: 'GitHub', allow: true, Component: ScopePhaseAreaGitHub},
    {icon: <JiraSVG />, label: 'Jira', allow: true, Component: ScopePhaseAreaJira},
    {
      icon: <ParabolLogoSVG />,
      label: 'Parabol',
      allow: true,
      Component: ScopePhaseAreaParabolScoping
    },
    {
      icon: <JiraServerSVG />,
      label: 'Jira Server',
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
    }
  ] as const

  const tabs = baseTabs.filter(({allow}) => allow)
  const [activeIdx, setActiveIdx] = useState(() => {
    const favoriteService = window.localStorage.getItem('favoriteService') || 'Jira'
    const idx = tabs.findIndex((tab) => tab.label === favoriteService)
    return idx === -1 ? 1 : idx
  })

  const isTabActive = (label: typeof baseTabs[number]['label']) => {
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
    <ScopingArea isDesktop={isDesktop}>
      <StyledTabsBar activeIdx={activeIdx}>
        {tabs.map((tab, idx) => (
          <Tab
            key={tab.label}
            label={
              <TabLabel>
                <TabIcon>{tab.icon}</TabIcon>
                {tab.label}
              </TabLabel>
            }
            onClick={() => selectIdx(idx)}
          />
        ))}
      </StyledTabsBar>
      <SwipeableViews
        enableMouseEvents={false} // disable because this works even if a modal is on top of it
        index={activeIdx}
        onChangeIndex={onChangeIdx as any}
        containerStyle={containerStyle}
        style={innerStyle}
      >
        {/* swipeable views won't ignore null children: https://github.com/oliviertassinari/react-swipeable-views/issues/271 */}
        {tabs.map(({label, Component}) => (
          <TabContents key={label}>
            <Component
              meetingRef={meeting}
              isActive={isTabActive(label)}
              gotoParabol={gotoParabol}
            />
          </TabContents>
        ))}
      </SwipeableViews>
    </ScopingArea>
  )
}

graphql`
  fragment ScopePhaseArea_phase on GenericMeetingPhase {
    id
  }
`

export default createFragmentContainer(ScopePhaseArea, {
  meeting: graphql`
    fragment ScopePhaseArea_meeting on PokerMeeting {
      ...StageTimerDisplay_meeting
      ...StageTimerControl_meeting
      ...ScopePhaseAreaGitHub_meeting
      ...ScopePhaseAreaGitLab_meeting
      ...ScopePhaseAreaJira_meeting
      ...ScopePhaseAreaJiraServer_meeting
      ...ScopePhaseAreaParabolScoping_meeting
      ...ScopePhaseAreaAzureDevOps_meeting
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
          }
        }
        user {
          featureFlags {
            azureDevOps
          }
        }
      }
    }
  `
})
