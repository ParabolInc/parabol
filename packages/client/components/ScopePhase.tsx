import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {ScopePhase_meeting$key} from '~/__generated__/ScopePhase_meeting.graphql'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import {PokerMeetingPhaseProps} from './PokerMeeting'
import ScopePhaseArea from './ScopePhaseArea'
import StageTimerDisplay from './StageTimerDisplay'
interface Props extends PokerMeetingPhaseProps {
  meeting: ScopePhase_meeting$key
  gotoStageId?: ReturnType<typeof useGotoStageId>
}

const ScopePhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhase_meeting on PokerMeeting {
        ...StageTimerDisplay_meeting
        ...StageTimerControl_meeting
        ...ScopePhaseArea_meeting
        endedAt
        localStage {
          isComplete
        }
        phases {
          stages {
            isComplete
          }
        }
        showSidebar
      }
    `,
    meetingRef
  )
  const {endedAt, showSidebar} = meeting
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.SCOPE}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{'Add tasks to be estimated'}</PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay meeting={meeting} />
          <ScopePhaseArea meeting={meeting} />
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment ScopePhase_phase on ReflectPhase {
    focusedPromptId
    reflectPrompts {
      ...PhaseItemColumn_prompt
      id
    }
  }
`

export default ScopePhase
