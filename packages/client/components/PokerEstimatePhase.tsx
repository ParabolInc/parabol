import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import {PokerEstimatePhase_meeting} from '../__generated__/PokerEstimatePhase_meeting.graphql'
import EstimatePhaseArea from './EstimatePhaseArea'
import EstimatePhaseDiscussionDrawer from './EstimatePhaseDiscussionDrawer'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import PokerEstimateHeaderCardJira from './PokerEstimateHeaderCardJira'
import {PokerMeetingPhaseProps} from './PokerMeeting'
import {Breakpoint} from '~/types/constEnums'
import useBreakpoint from '~/hooks/useBreakpoint'
import useSidebar from '~/hooks/useSidebar'
import SwipeableDashSidebar from './SwipeableDashSidebar'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import {PALETTE} from '~/styles/paletteV2'
interface Props extends PokerMeetingPhaseProps {
  meeting: PokerEstimatePhase_meeting
}

const Header = styled('div')({
  display: 'flex',
  width: '100%'
})

const MeetingTopBarWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%'
})

const StyledIcon = styled(Icon)({
  color: '#FFFF',
  fontSize: 30,
  transform: 'scaleX(-1)'
})

const ButtonContainer = styled('div')({
  padding: '8px 0',
  left: -8,
  position: 'relative'
})

const ShowDiscussionButton = styled(PlainButton)({
  alignItems: 'center',
  backgroundColor: PALETTE.TEXT_PURPLE,
  borderRadius: '50%',
  display: 'flex',
  height: 48,
  padding: 8
})

const PokerEstimatePhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const {localStage, endedAt, showSidebar} = meeting
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {isOpen, toggle: toggleDrawer} = useSidebar(showSidebar)
  if (!localStage) return null
  const {story} = localStage
  const {__typename} = story!

  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <Header>
          <MeetingTopBarWrapper>
            <MeetingTopBar
              avatarGroup={avatarGroup}
              isMeetingSidebarCollapsed={!showSidebar}
              toggleSidebar={toggleSidebar}
            >
              <PhaseHeaderTitle>{phaseLabelLookup.ESTIMATE}</PhaseHeaderTitle>
              <PhaseHeaderDescription>{'Estimate each story as a team'}</PhaseHeaderDescription>
            </MeetingTopBar>
          </MeetingTopBarWrapper>
          {!isDesktop && (
            <ButtonContainer>
              <ShowDiscussionButton onClick={toggleDrawer}>
                <StyledIcon>comment</StyledIcon>
              </ShowDiscussionButton>
            </ButtonContainer>
          )}
        </Header>
        {__typename === 'JiraIssue' && <PokerEstimateHeaderCardJira stage={localStage as any} />}

        <PhaseWrapper>
          <EstimatePhaseArea />
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
      {isDesktop ? (
        <EstimatePhaseDiscussionDrawer isDesktop={isDesktop} meeting={meeting} />
      ) : (
        <SwipeableDashSidebar isOpen={isOpen} isRightSidebar onToggle={toggleDrawer}>
          <EstimatePhaseDiscussionDrawer isDesktop={isDesktop} meeting={meeting} />
        </SwipeableDashSidebar>
      )}
    </MeetingContent>
  )
}

graphql`
  fragment PokerEstimatePhaseStage on EstimateStage {
    ...PokerEstimateHeaderCardJira_stage
    story {
      __typename
    }
  }
`
export default createFragmentContainer(PokerEstimatePhase, {
  meeting: graphql`
    fragment PokerEstimatePhase_meeting on PokerMeeting {
      id
      endedAt
      showSidebar
      localStage {
        ...PokerEstimatePhaseStage @relay(mask: false)
      }
      phases {
        ... on EstimatePhase {
          stages {
            ...PokerEstimatePhaseStage @relay(mask: false)
          }
        }
      }
      ...EstimatePhaseDiscussionDrawer_meeting
    }
  `
})
