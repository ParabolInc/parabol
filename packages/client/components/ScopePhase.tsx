import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {ScopePhase_meeting} from '~/__generated__/ScopePhase_meeting.graphql'
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
  meeting: ScopePhase_meeting
}

const ScopePhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const phaseRef = useRef<HTMLDivElement>(null)
  const {localPhase, endedAt, showSidebar} = meeting
  if (!localPhase) return null
  return (
    <MeetingContent ref={phaseRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.SCOPE}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {'Add tasks to be estimated'}
          </PhaseHeaderDescription>
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

export default createFragmentContainer(ScopePhase, {
  meeting: graphql`
    fragment ScopePhase_meeting on PokerMeeting {
      ...StageTimerDisplay_meeting
      ...StageTimerControl_meeting
      ...ScopePhaseArea_meeting
      endedAt
      localPhase {
        ...ScopePhase_phase @relay(mask: false)
      }
      localStage {
        isComplete
      }
      phases {
        ...ScopePhase_phase @relay(mask: false)
      }
      showSidebar
    }
  `
})
