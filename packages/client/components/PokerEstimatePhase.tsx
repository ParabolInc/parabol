import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
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
import PokerEstimateHeaderCardParabol from './PokerEstimateHeaderCardParabol'
import {PokerMeetingPhaseProps} from './PokerMeeting'
import {Breakpoint, DiscussionThreadEnum} from '~/types/constEnums'
import useBreakpoint from '~/hooks/useBreakpoint'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import styled from '@emotion/styled'
import useGotoStageId from '~/hooks/useGotoStageId'

const StyledMeetingHeaderAndPhase = styled(MeetingHeaderAndPhase)<{isOpen: boolean}>(
  ({isOpen}) => ({
    width: isOpen ? `calc(100% - ${DiscussionThreadEnum.WIDTH}px)` : '100%'
  })
)

interface Props extends PokerMeetingPhaseProps {
  gotoStageId: ReturnType<typeof useGotoStageId>
  meeting: PokerEstimatePhase_meeting
  toggleDrawer: () => void
}

const PokerEstimatePhase = (props: Props) => {
  const {avatarGroup, meeting, toggleDrawer, toggleSidebar, gotoStageId} = props
  const {localStage, endedAt, isCommentUnread, isRightDrawerOpen, showSidebar} = meeting
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const meetingContentRef = useRef<HTMLDivElement>(null)
  if (!localStage) return null
  const {story} = localStage
  const {__typename} = story!
  return (
    <MeetingContent ref={meetingContentRef}>
      <StyledMeetingHeaderAndPhase isOpen={isRightDrawerOpen} hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isCommentUnread={isCommentUnread}
          isMeetingSidebarCollapsed={!showSidebar}
          isRightDrawerOpen={isRightDrawerOpen}
          toggleSidebar={toggleSidebar}
          toggleDrawer={toggleDrawer}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.ESTIMATE}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{'Estimate each story as a team'}</PhaseHeaderDescription>
        </MeetingTopBar>
        {__typename === 'JiraIssue' && <PokerEstimateHeaderCardJira stage={localStage as any} />}
        {__typename === 'Task' && <PokerEstimateHeaderCardParabol stage={localStage as any} />}
        <PhaseWrapper>
          <EstimatePhaseArea gotoStageId={gotoStageId} meeting={meeting} />
        </PhaseWrapper>
      </StyledMeetingHeaderAndPhase>
      <ResponsiveDashSidebar isOpen={isRightDrawerOpen} isRightDrawer onToggle={toggleDrawer}>
        <EstimatePhaseDiscussionDrawer
          isDesktop={isDesktop}
          isOpen={isRightDrawerOpen}
          meeting={meeting}
          meetingContentRef={meetingContentRef}
          onToggle={toggleDrawer}
        />
      </ResponsiveDashSidebar>
    </MeetingContent>
  )
}

graphql`
  fragment PokerEstimatePhaseStage on EstimateStage {
    ...PokerEstimateHeaderCardJira_stage
    ...PokerEstimateHeaderCardParabol_stage
    story {
      __typename
    }
  }
`
export default createFragmentContainer(PokerEstimatePhase, {
  meeting: graphql`
    fragment PokerEstimatePhase_meeting on PokerMeeting {
      ...EstimatePhaseArea_meeting
      id
      endedAt
      isCommentUnread
      isRightDrawerOpen
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
      showSidebar
      ...EstimatePhaseDiscussionDrawer_meeting
    }
  `
})
