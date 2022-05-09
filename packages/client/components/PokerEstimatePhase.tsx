import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import useGotoStageId from '~/hooks/useGotoStageId'
import useRightDrawer from '~/hooks/useRightDrawer'
import {Breakpoint, DiscussionThreadEnum} from '~/types/constEnums'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import ErrorBoundary from './ErrorBoundary'
import EstimatePhaseArea from './EstimatePhaseArea'
import EstimatePhaseDiscussionDrawer from './EstimatePhaseDiscussionDrawer'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PokerEstimateHeaderCard from './PokerEstimateHeaderCard'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'

const StyledMeetingHeaderAndPhase = styled(MeetingHeaderAndPhase)<{isOpen: boolean}>(
  ({isOpen}) => ({
    width: isOpen ? `calc(100% - ${DiscussionThreadEnum.WIDTH}px)` : '100%'
  })
)

const StoryAndEstimateWrapper = styled('div')({
  display: 'flex',
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  flexDirection: 'column'
})

const EstimateAreaWrapper = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
})

type Props = {
  toggleSidebar: () => void
  avatarGroup: ReactElement
  gotoStageId: ReturnType<typeof useGotoStageId>
  queryRef: PreloadedQuery<any> // TODO: update
}

const PokerEstimatePhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, gotoStageId, queryRef} = props

  const data = usePreloadedQuery(
    graphql`
      query PokerEstimatePhaseQuery($meetingId: ID!) {
        viewer {
          meeting(meetingId: $meetingId) {
            ... on PokerMeeting {
              ...EstimatePhaseArea_meeting
              id
              endedAt
              isCommentUnread
              isRightDrawerOpen
              localStage {
                ...PokerEstimateHeaderCard_stage
              }
              # phases {
              #   ... on EstimatePhase {
              #     stages {
              #       ...PokerEstimateHeaderCard_stage
              #     }
              #   }
              # }
              showSidebar
              ...EstimatePhaseDiscussionDrawer_meeting
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {viewer} = data
  const {meeting} = viewer
  const {
    id: meetingId,
    localStage,
    endedAt,
    isCommentUnread,
    isRightDrawerOpen,
    showSidebar
  } = meeting
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const toggleDrawer = useRightDrawer(meetingId)

  if (!localStage) return null
  return (
    <MeetingContent>
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
        <StoryAndEstimateWrapper>
          <ErrorBoundary>
            <PokerEstimateHeaderCard stage={localStage} />
          </ErrorBoundary>
          <EstimateAreaWrapper>
            <EstimatePhaseArea gotoStageId={gotoStageId} meeting={meeting} />
          </EstimateAreaWrapper>
        </StoryAndEstimateWrapper>
      </StyledMeetingHeaderAndPhase>
      <ResponsiveDashSidebar
        isOpen={isRightDrawerOpen}
        isRightDrawer
        onToggle={toggleDrawer}
        sidebarWidth={DiscussionThreadEnum.WIDTH}
      >
        <EstimatePhaseDiscussionDrawer
          isDesktop={isDesktop}
          isOpen={isRightDrawerOpen}
          meeting={meeting}
          onToggle={toggleDrawer}
        />
      </ResponsiveDashSidebar>
    </MeetingContent>
  )
}

export default PokerEstimatePhase
