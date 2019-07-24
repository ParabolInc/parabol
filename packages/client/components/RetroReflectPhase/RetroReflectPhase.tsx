import {RetroReflectPhase_team} from '../../../__generated__/RetroReflectPhase_team.graphql'
import ms from 'ms'
import React, {useRef} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import BottomNavControl from '../BottomNavControl'
import BottomNavIconLabel from '../BottomNavIconLabel'
import ErrorBoundary from '../ErrorBoundary'
import MeetingContent from '../MeetingContent'
import MeetingContentHeader from '../MeetingContentHeader'
import MeetingPhaseWrapper from '../MeetingPhaseWrapper'
import MeetingHelpToggle from '../MenuHelpToggle'
import PhaseHeaderDescription from '../PhaseHeaderDescription'
import PhaseHeaderTitle from '../PhaseHeaderTitle'
import Overflow from '../Overflow'
import {RetroMeetingPhaseProps} from '../RetroMeeting'
import PhaseItemColumn from './PhaseItemColumn'
import useAtmosphere from '../../hooks/useAtmosphere'
import useTimeout from '../../hooks/useTimeout'
import MeetingControlBar from '../../modules/meeting/components/MeetingControlBar/MeetingControlBar'
import {NewMeetingPhaseTypeEnum} from '../../types/graphql'
import {GROUP} from '../../utils/constants'
import handleRightArrow from '../../utils/handleRightArrow'
import isDemoRoute from '../../utils/isDemoRoute'
import lazyPreload from '../../utils/lazyPreload'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import {REFLECTION_WIDTH} from '../../utils/multiplayerMasonry/masonryConstants'
import EndMeetingButton from '../EndMeetingButton'
import StageTimerControl from '../StageTimerControl'
import StageTimerDisplay from './StageTimerDisplay'

const minWidth = REFLECTION_WIDTH + 32

const StyledOverflow = styled(Overflow)({
  // using position helps with overflow of columns for small screens
  position: 'relative'
})

const StyledWrapper = styled(MeetingPhaseWrapper)<{phaseItemCount: number}>(({phaseItemCount}) => ({
  minWidth: phaseItemCount * minWidth,
  // using position helps with overflow of columns for small screens
  position: 'absolute'
}))

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

const BottomControlSpacer = styled('div')({
  minWidth: 96
})

interface Props extends RetroMeetingPhaseProps {
  team: RetroReflectPhase_team
}

const ReflectHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'ReflectHelpMenu' */ '../MeetingHelp/ReflectHelpMenu')
)
const DemoReflectHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoReflectHelpMenu' */ '../MeetingHelp/DemoReflectHelpMenu')
)

const RetroReflectPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, team, handleGotoNext, isDemoStageComplete} = props
  const atmosphere = useAtmosphere()
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const minTimeComplete = useTimeout(ms('2m'))
  const phaseRef = useRef<HTMLDivElement>(null)
  const {viewerId} = atmosphere
  const {isMeetingSidebarCollapsed, newMeeting} = team
  if (!newMeeting) return null
  const {facilitatorUserId, localPhase, id: meetingId, reflectionGroups, localStage} = newMeeting
  const isComplete = localStage ? localStage.isComplete : false
  const isAsync = localStage ? localStage.isAsync : false
  const reflectPrompts = localPhase!.reflectPrompts!
  const isFacilitating = facilitatorUserId === viewerId
  const nextPhaseLabel = phaseLabelLookup[GROUP]
  const isEmpty = !reflectionGroups || reflectionGroups.length === 0
  const isReadyToGroup =
    !isAsync &&
    !isComplete &&
    !isEmpty &&
    minTimeComplete &&
    reflectPrompts.reduce(
      (sum, prompt) => sum + (prompt.editorIds ? prompt.editorIds.length : 0),
      0
    ) === 0
  return (
    <MeetingContent>
      <MeetingContentHeader
        avatarGroup={avatarGroup}
        isMeetingSidebarCollapsed={!!isMeetingSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      >
        <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.reflect]}</PhaseHeaderTitle>
        <PhaseHeaderDescription>
          {'Add anonymous reflections for each prompt'}
        </PhaseHeaderDescription>
      </MeetingContentHeader>
      <ErrorBoundary>
        <StageTimerDisplay stage={localStage!} />
        <StyledOverflow>
          <StyledWrapper phaseItemCount={reflectPrompts.length} ref={phaseRef}>
            {reflectPrompts.map((prompt, idx) => (
              <PhaseItemColumn
                key={prompt.id}
                meeting={newMeeting}
                retroPhaseItemId={prompt.id}
                question={prompt.question}
                editorIds={prompt.editorIds}
                description={prompt.description}
                idx={idx}
                phaseRef={phaseRef}
              />
            ))}
          </StyledWrapper>
        </StyledOverflow>
        {isFacilitating && (
          <StyledBottomBar>
            {isComplete ? (
              <BottomControlSpacer />
            ) : (
              <StageTimerControl defaultTimeLimit={5} meetingId={meetingId} team={team} />
            )}
            <BottomNavControl
              isBouncing={isDemoStageComplete || isReadyToGroup}
              disabled={isEmpty}
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
            <EndMeetingButton meetingId={meetingId} />
          </StyledBottomBar>
        )}
        <MeetingHelpToggle
          floatAboveBottomBar={isFacilitating}
          menu={isDemoRoute() ? <DemoReflectHelpMenu /> : <ReflectHelpMenu />}
        />
      </ErrorBoundary>
    </MeetingContent>
  )
}

graphql`
  fragment RetroReflectPhase_phase on ReflectPhase {
    reflectPrompts {
      id
      question
      description
      editorIds
    }
    stages {
      ...StageTimerDisplay_stage
      isAsync
      isComplete
    }
  }
`

export default createFragmentContainer(RetroReflectPhase, {
  team: graphql`
    fragment RetroReflectPhase_team on Team {
      ...StageTimerControl_team
      isMeetingSidebarCollapsed
      newMeeting {
        ...PhaseItemColumn_meeting
        id
        facilitatorUserId
        ... on RetrospectiveMeeting {
          localStage {
            ...StageTimerDisplay_stage
            isAsync
            isComplete
          }
          reflectionGroups {
            id
          }
          localPhase {
            ...RetroReflectPhase_phase @relay(mask: false)
          }
          phases {
            ...RetroReflectPhase_phase @relay(mask: false)
          }
        }
      }
    }
  `
})
