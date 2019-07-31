import {RetroReflectPhase_team} from '../../__generated__/RetroReflectPhase_team.graphql'
import ms from 'ms'
import React, {useRef, useState} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import BottomNavControl from '../BottomNavControl'
import BottomNavIconLabel from '../BottomNavIconLabel'
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
import MeetingFacilitatorBar from '../../modules/meeting/components/MeetingControlBar/MeetingFacilitatorBar'
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
import MeetingHeaderAndPhase from '../MeetingHeaderAndPhase'
import PhaseWrapper from '../PhaseWrapper'
import SwipeableViews from 'react-swipeable-views'
import useBreakpoint from '../../hooks/useBreakpoint'

// const minWidth = REFLECTION_WIDTH + 32

const StyledWrapper = styled(MeetingPhaseWrapper)({

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
  const [activeIdx, setActiveIdx] = useState(0)
  const isDesktop = useBreakpoint(REFLECTION_WIDTH * 2 + 32)
  console.log('isDes', isDesktop)
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase>
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
          <PhaseWrapper>
            <StageTimerDisplay stage={localStage!} />
              <StyledWrapper phaseItemCount={reflectPrompts.length} ref={phaseRef}>
                {isDesktop ?
                  reflectPrompts.map((prompt, idx) => (
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
                    )) :
                  <SwipeableViews
                    enableMouseEvents
                    index={activeIdx}
                    onChangeIndex={(idx) => setActiveIdx(idx)}
                    containerStyle={{height: '100%'}}
                    style={{height: '100%'}}
                  >
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
                  </SwipeableViews>
                }
              </StyledWrapper>
          </PhaseWrapper>
          <MeetingHelpToggle
            menu={isDemoRoute() ? <DemoReflectHelpMenu /> : <ReflectHelpMenu />}
          />
      </MeetingHeaderAndPhase>
      {isFacilitating && (
        <MeetingFacilitatorBar>
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
        </MeetingFacilitatorBar>
      )}
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
