import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import React, {useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import {RetroReflectPhase_meeting} from '__generated__/RetroReflectPhase_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useBreakpoint from '../../hooks/useBreakpoint'
import useMeetingProgressTimeout from '../../hooks/useMeetingProgressTimeout'
import MeetingFacilitatorBar from '../../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
import {Breakpoint, ElementWidth} from '../../types/constEnums'
import {NewMeetingPhaseTypeEnum} from '../../types/graphql'
import {GROUP} from '../../utils/constants'
import handleRightArrow from '../../utils/handleRightArrow'
import isDemoRoute from '../../utils/isDemoRoute'
import lazyPreload from '../../utils/lazyPreload'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import BottomNavControl from '../BottomNavControl'
import BottomNavIconLabel from '../BottomNavIconLabel'
import EndMeetingButton from '../EndMeetingButton'
import MeetingContent from '../MeetingContent'
import MeetingHeaderAndPhase from '../MeetingHeaderAndPhase'
import MeetingTopBar from '../MeetingTopBar'
import MeetingHelpToggle from '../MenuHelpToggle'
import PhaseHeaderDescription from '../PhaseHeaderDescription'
import PhaseHeaderTitle from '../PhaseHeaderTitle'
import PhaseWrapper from '../PhaseWrapper'
import {RetroMeetingPhaseProps} from '../RetroMeeting'
import StageTimerControl from '../StageTimerControl'
import PhaseItemColumn from './PhaseItemColumn'
import ReflectWrapperMobile from './ReflectionWrapperMobile'
import ReflectWrapperDesktop from './ReflectWrapperDesktop'
import StageTimerDisplay from './StageTimerDisplay'

const CenterControlBlock = styled('div')<{isComplete: boolean}>(({isComplete}) => ({
  margin: '0 auto',
  paddingLeft: isComplete ? ElementWidth.END_MEETING_BUTTON : undefined
}))

interface Props extends RetroMeetingPhaseProps {
  meeting: RetroReflectPhase_meeting
}

const ReflectHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'ReflectHelpMenu' */ '../MeetingHelp/ReflectHelpMenu')
)
const DemoReflectHelpMenu = lazyPreload(async () =>
  import(/* webpackChunkName: 'DemoReflectHelpMenu' */ '../MeetingHelp/DemoReflectHelpMenu')
)

const RetroReflectPhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting, handleGotoNext, isDemoStageComplete} = props
  const atmosphere = useAtmosphere()
  const {gotoNext, ref: gotoNextRef} = handleGotoNext
  const phaseRef = useRef<HTMLDivElement>(null)
  const {viewerId} = atmosphere
  const [activeIdx, setActiveIdx] = useState(0)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)
  const {
    endedAt,
    facilitatorUserId,
    localPhase,
    id: meetingId,
    reflectionGroups,
    showSidebar,
    localStage
  } = meeting
  const [timedOut] = useMeetingProgressTimeout(ms('2m'), localStage?.localScheduledEndTime)
  if (!localStage || !localPhase || !localPhase.reflectPrompts) return null
  const {isComplete, isAsync} = localStage
  const reflectPrompts = localPhase!.reflectPrompts

  const focusedPhaseItemId = localPhase!.focusedPhaseItemId
  const isFacilitating = facilitatorUserId === viewerId && !endedAt
  const nextPhaseLabel = phaseLabelLookup[GROUP]
  const isEmpty = !reflectionGroups || reflectionGroups.length === 0
  const isReadyToGroup =
    !isAsync &&
    !isComplete &&
    !isEmpty &&
    timedOut &&
    reflectPrompts.reduce(
      (sum, prompt) => sum + (prompt.editorIds ? prompt.editorIds.length : 0),
      0
    ) === 0
  const ColumnWrapper = isDesktop ? ReflectWrapperDesktop : ReflectWrapperMobile
  return (
    <MeetingContent ref={phaseRef}>
      <MeetingHeaderAndPhase>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup[NewMeetingPhaseTypeEnum.reflect]}</PhaseHeaderTitle>
          <PhaseHeaderDescription>
            {'Add anonymous reflections for each prompt'}
          </PhaseHeaderDescription>
        </MeetingTopBar>
        <PhaseWrapper>
          <StageTimerDisplay stage={localStage!} />
          <ColumnWrapper
            setActiveIdx={setActiveIdx}
            activeIdx={activeIdx}
            focusedIdx={reflectPrompts.findIndex(({id}) => id === focusedPhaseItemId)}
          >
            {reflectPrompts.map((prompt, idx) => (
              <PhaseItemColumn
                key={prompt.id}
                meeting={meeting}
                retroPhaseItemId={prompt.id}
                question={prompt.question}
                editorIds={prompt.editorIds}
                description={prompt.description}
                idx={idx}
                phaseRef={phaseRef}
                isDesktop={isDesktop}
              />
            ))}
          </ColumnWrapper>
        </PhaseWrapper>
        <MeetingHelpToggle menu={isDemoRoute() ? <DemoReflectHelpMenu /> : <ReflectHelpMenu />} />
      </MeetingHeaderAndPhase>
      <MeetingFacilitatorBar isFacilitating={isFacilitating}>
        {!isComplete && <StageTimerControl defaultTimeLimit={5} meeting={meeting} />}
        <CenterControlBlock isComplete={isComplete}>
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
        </CenterControlBlock>
        <EndMeetingButton meetingId={meetingId} isEnded={!!endedAt} />
      </MeetingFacilitatorBar>
    </MeetingContent>
  )
}

graphql`
  fragment RetroReflectPhase_phase on ReflectPhase {
    focusedPhaseItemId
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
      localScheduledEndTime
    }
  }
`

export default createFragmentContainer(RetroReflectPhase, {
  meeting: graphql`
    fragment RetroReflectPhase_meeting on RetrospectiveMeeting {
      endedAt
      showSidebar
      ...StageTimerControl_meeting
      ...PhaseItemColumn_meeting
      id
      facilitatorUserId
      ... on RetrospectiveMeeting {
        localStage {
          ...StageTimerDisplay_stage
          isAsync
          isComplete
          localScheduledEndTime
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
  `
})
