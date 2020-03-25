import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {RetroVotePhase_meeting} from '__generated__/RetroVotePhase_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import MeetingFacilitatorBar from '../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import {ElementWidth} from '../types/constEnums'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {DISCUSS} from '../utils/constants'
import handleRightArrow from '../utils/handleRightArrow'
import isDemoRoute from '../utils/isDemoRoute'
import lazyPreload from '../utils/lazyPreload'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'
import EndMeetingButton from './EndMeetingButton'
import GroupingKanban from './GroupingKanban'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingTopBar from './MeetingTopBar'
import MeetingHelpToggle from './MenuHelpToggle'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import {RetroMeetingPhaseProps} from './RetroMeeting'
import StageTimerDisplay from './RetroReflectPhase/StageTimerDisplay'
import StageTimerControl from './StageTimerControl'
import RetroVoteMetaHeader from './RetroVoteMetaHeader'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroVotePhase_meeting
}

const CenterControlBlock = styled('div')<{isComplete: boolean}>(({isComplete}) => ({
  margin: '0 auto',
  paddingLeft: isComplete ? ElementWidth.END_MEETING_BUTTON : undefined
}))

const VoteHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'VoteHelpMenu' */ './MeetingHelp/VoteHelpMenu')
)
const DemoVoteHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoVoteHelpMenu' */ './MeetingHelp/DemoVoteHelpMenu')
)

const RetroVotePhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, handleGotoNext, meeting} = props
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const phaseRef = useRef<HTMLDivElement>(null)
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const {endedAt, facilitatorUserId, id: meetingId, phases, localStage, showSidebar} = meeting
  const isComplete = localStage ? localStage.isComplete : false
  const teamVotesRemaining = meeting.votesRemaining || 0
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS)!
  const discussStage = discussPhase.stages![0]
  const nextPhaseLabel = phaseLabelLookup[DISCUSS]
  return (
    <MeetingContent ref={phaseRef}>
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.vote]}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {'Vote on the topics you want to discuss'}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <RetroVoteMetaHeader meeting={meeting} />
          <StageTimerDisplay meeting={meeting} />
          <MeetingPhaseWrapper>
            <GroupingKanban meeting={meeting} phaseRef={phaseRef} />
          </MeetingPhaseWrapper>
        </PhaseWrapper>
        <MeetingHelpToggle menu={isDemoRoute() ? <DemoVoteHelpMenu /> : <VoteHelpMenu />} />
      </MeetingHeaderAndPhase>
      <MeetingFacilitatorBar isFacilitating={isFacilitating}>
        {!isComplete && <StageTimerControl defaultTimeLimit={3} meeting={meeting} />}
        <CenterControlBlock isComplete={isComplete}>
          <BottomNavControl
            isBouncing={teamVotesRemaining === 0}
            disabled={!discussStage.isNavigableByFacilitator}
            onClick={() => gotoNext()}
            onKeyDown={handleRightArrow(() => gotoNext())}
            ref={gotoNextRef}
          >
            <BottomNavIconLabel
              icon='arrow_forward'
              iconColor='warm'
              label={`Next: ${nextPhaseLabel}`}
            />
          </BottomNavControl>
        </CenterControlBlock>
        <EndMeetingButton meetingId={meetingId} isEnded={!!endedAt} />
      </MeetingFacilitatorBar>
    </MeetingContent>
  )
}

export default createFragmentContainer(RetroVotePhase, {
  meeting: graphql`
    fragment RetroVotePhase_meeting on RetrospectiveMeeting {
      ...StageTimerControl_meeting
      ...StageTimerDisplay_meeting
      ...GroupingKanban_meeting
      ...RetroVoteMetaHeader_meeting
      endedAt
      showSidebar
      id
      facilitatorUserId
      localStage {
        isComplete
      }
      phases {
        phaseType
        ... on DiscussPhase {
          stages {
            ... on RetroDiscussStage {
              id
              isNavigableByFacilitator
            }
          }
        }
      }
      votesRemaining
    }
  `
})
