import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useMeetingProgressTimeout from 'hooks/useMeetingProgressTimeout'
import ms from 'ms'
/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import React, {useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {RetroGroupPhase_meeting} from '__generated__/RetroGroupPhase_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import MeetingFacilitatorBar from '../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import {ElementWidth} from '../types/constEnums'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import {VOTE} from '../utils/constants'
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

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroGroupPhase_meeting
}

const CenteredControlBlock = styled('div')<{isComplete: boolean | undefined}>(({isComplete}) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'space-evenly',
  marginLeft: isComplete ? ElementWidth.END_MEETING_BUTTON : undefined
}))

const GroupHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'GroupHelpMenu' */ './MeetingHelp/GroupHelpMenu')
)
const DemoGroupHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoGroupHelpMenu' */ './MeetingHelp/DemoGroupHelpMenu')
)

const RetroGroupPhase = (props: Props) => {
  const atmosphere = useAtmosphere()
  const phaseRef = useRef<HTMLDivElement>(null)
  // const {onCompleted, submitMutation, error, onError, submitting} = useMutationProps()
  const {avatarGroup, toggleSidebar, handleGotoNext, meeting, isDemoStageComplete} = props
  const {viewerId} = atmosphere
  const {endedAt, showSidebar, facilitatorUserId, id: meetingId, localStage} = meeting
  const [timedOut, resetActivityTimeout] = useMeetingProgressTimeout(
    ms('1m'),
    localStage?.localScheduledEndTime,
    ms('30s')
  )
  const isComplete = localStage ? localStage.isComplete : false
  const isAsync = localStage ? localStage.isAsync : false
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const nextPhaseLabel = phaseLabelLookup[VOTE]
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  return (
    <MeetingContent ref={phaseRef}>
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.group]}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{'Drag cards to group by common topics'}</PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay stage={localStage!} />
          {/*{error && <StyledError>{error}</StyledError>}*/}
          <MeetingPhaseWrapper>
            <GroupingKanban
              meeting={meeting}
              phaseRef={phaseRef}
              resetActivityTimeout={resetActivityTimeout}
            />
          </MeetingPhaseWrapper>
        </PhaseWrapper>
        <MeetingHelpToggle menu={isDemoRoute() ? <DemoGroupHelpMenu /> : <GroupHelpMenu />} />
      </MeetingHeaderAndPhase>
      <MeetingFacilitatorBar isFacilitating={isFacilitating}>
        {!isComplete && <StageTimerControl defaultTimeLimit={5} meeting={meeting} />}
        <CenteredControlBlock isComplete={isComplete}>
          <BottomNavControl
            isBouncing={isDemoStageComplete || (!isAsync && !isComplete && timedOut)}
            disabled={isDemoRoute() && !isDemoStageComplete}
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
        </CenteredControlBlock>
        <EndMeetingButton meetingId={meetingId} isEnded={!!endedAt} />
      </MeetingFacilitatorBar>
    </MeetingContent>
  )
}

graphql`
  fragment RetroGroupPhase_stage on GenericMeetingStage {
    ...StageTimerDisplay_stage
    isAsync
    isComplete
    localScheduledEndTime
  }
`

export default createFragmentContainer(RetroGroupPhase, {
  meeting: graphql`
    fragment RetroGroupPhase_meeting on RetrospectiveMeeting {
      ...StageTimerControl_meeting
      endedAt
      showSidebar
      id
      facilitatorUserId
      ... on RetrospectiveMeeting {
        ...GroupingKanban_meeting
        localStage {
          ...RetroGroupPhase_stage @relay(mask: false)
        }
        phases {
          stages {
            ...RetroGroupPhase_stage @relay(mask: false)
          }
        }
        nextAutoGroupThreshold
      }
    }
  `
})
