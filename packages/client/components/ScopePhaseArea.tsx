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
import GitHubSVG from './GitHubSVG'
import GitLabSVG from './GitLabSVG'
import Icon from './Icon'
import JiraServerSVG from './JiraServerSVG'
import JiraSVG from './JiraSVG'
import ParabolLogoSVG from './ParabolLogoSVG'
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
  const [activeIdx, setActiveIdx] = useState(1)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {viewerMeetingMember} = meeting
  if (!viewerMeetingMember) return null
  const {user, teamMember} = viewerMeetingMember
  const {featureFlags} = user
  const gitlabIntegration = teamMember.integrations.gitlab
  const jiraServerIntegration = teamMember.integrations.jiraServer
  const isGitLabProviderAvailable = !!(
    gitlabIntegration.cloudProvider?.clientId || gitlabIntegration.sharedProviders.length
  )

  const allowGitLab = isGitLabProviderAvailable && featureFlags.gitlab
  const allowJiraServer = !!jiraServerIntegration.sharedProviders.length

  const baseTabs = [
    {icon: <GitHubSVG />, label: 'GitHub', allow: true},
    {icon: <JiraSVG />, label: 'Jira', allow: true},
    {icon: <ParabolLogoSVG />, label: 'Parabol', allow: true},
    {icon: <JiraServerSVG />, label: 'Jira Server', allow: allowJiraServer},
    {icon: <GitLabSVG />, label: 'GitLab', allow: allowGitLab}
  ] as const

  const tabs = baseTabs.filter(({allow}) => allow)

  const isTabActive = (label: typeof baseTabs[number]['label']) => {
    return activeIdx === tabs.findIndex((tab) => tab.label === label)
  }

  const onChangeIdx = (idx, _fromIdx, props: {reason: string}) => {
    //very buggy behavior, probably linked to the vertical scrolling.
    // to repro, go from team > org > team > org by clicking tabs & see this this get called for who knows why
    if (props.reason === 'focus') return
    setActiveIdx(idx)
  }

  const goToParabol = () => {
    setActiveIdx(2)
  }

  // swipeable views won't ignore null children, so conditionally create them: https://github.com/oliviertassinari/react-swipeable-views/issues/271
  const contents: Partial<Record<typeof baseTabs[number]['label'], JSX.Element>> = {
    GitHub: (
      <ScopePhaseAreaGitHub
        isActive={isTabActive('GitHub')}
        gotoParabol={goToParabol}
        meetingRef={meeting}
      />
    ),
    Jira: (
      <ScopePhaseAreaJira
        isActive={isTabActive('Jira')}
        gotoParabol={goToParabol}
        meeting={meeting}
      />
    ),
    Parabol: <ScopePhaseAreaParabolScoping isActive={isTabActive('Parabol')} meeting={meeting} />
  }

  if (allowJiraServer) {
    contents['Jira Server'] = (
      <ScopePhaseAreaJiraServer
        isActive={isTabActive('Jira Server')}
        gotoParabol={goToParabol}
        meetingRef={meeting}
      />
    )
  }
  if (allowGitLab) {
    contents['GitLab'] = (
      <ScopePhaseAreaGitLab
        isActive={isTabActive('GitLab')}
        gotoParabol={goToParabol}
        meetingRef={meeting}
      />
    )
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
            onClick={() => setActiveIdx(idx)}
          />
        ))}
      </StyledTabsBar>
      <SwipeableViews
        enableMouseEvents={false} // disable because this works even if a modal is on top of it
        index={activeIdx}
        onChangeIndex={onChangeIdx}
        containerStyle={containerStyle}
        style={innerStyle}
      >
        {Object.keys(contents).map((contentKey) => (
          <TabContents key={contentKey}>{contents[contentKey]}</TabContents>
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
          }
        }
        user {
          featureFlags {
            gitlab
          }
        }
      }
    }
  `
})
