import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {RetroVotePhase_meeting$key} from '~/__generated__/RetroVotePhase_meeting.graphql'
import useCallbackRef from '../hooks/useCallbackRef'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import GroupingKanban from './GroupingKanban'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingPhaseWrapper from './MeetingPhaseWrapper'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import {RetroMeetingPhaseProps} from './RetroMeeting'
import RetroVoteMetaHeader from './RetroVoteMetaHeader'
import StageTimerDisplay from './StageTimerDisplay'

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroVotePhase_meeting$key
}

const RetroVotePhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroVotePhase_meeting on RetrospectiveMeeting {
        ...StageTimerControl_meeting
        ...StageTimerDisplay_meeting
        ...GroupingKanban_meeting
        ...RetroVoteMetaHeader_meeting
        endedAt
        showSidebar
      }
    `,
    meetingRef
  )
  const [callbackRef, phaseRef] = useCallbackRef()
  const {endedAt, showSidebar} = meeting

  return (
    <MeetingContent ref={callbackRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.vote}</PhaseHeaderTitle>
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
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default RetroVotePhase
