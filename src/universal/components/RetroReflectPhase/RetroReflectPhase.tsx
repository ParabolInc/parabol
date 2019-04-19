import {RetroReflectPhase_team} from '__generated__/RetroReflectPhase_team.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import ReflectHelpMenu from 'universal/components/MeetingHelp/ReflectHelpMenu'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import PhaseItemColumn from 'universal/components/RetroReflectPhase/PhaseItemColumn'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import {GROUP} from 'universal/utils/constants'
import handleRightArrow from 'universal/utils/handleRightArrow'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import {REFLECTION_WIDTH} from 'universal/utils/multiplayerMasonry/masonryConstants'
import Overflow from 'universal/components/Overflow'
import isDemoRoute from 'universal/utils/isDemoRoute'
import EndMeetingButton from '../EndMeetingButton'
import DemoReflectHelpMenu from '../MeetingHelp/DemoReflectHelpMenu'
import ms from 'ms'

const minWidth = REFLECTION_WIDTH + 32

const StyledOverflow = styled(Overflow)({
  // using position helps with overflow of columns for small screens
  position: 'relative'
})

const StyledWrapper = styled(MeetingPhaseWrapper)(({phaseItemCount}: {phaseItemCount: number}) => ({
  minWidth: phaseItemCount * minWidth,
  // using position helps with overflow of columns for small screens
  position: 'absolute'
}))

const BottomControlSpacer = styled('div')({
  minWidth: '6rem'
})

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

interface Props extends WithAtmosphereProps {
  gotoNext: () => void
  gotoNextRef: React.RefObject<HTMLDivElement>
  isDemoStageComplete: boolean
  team: RetroReflectPhase_team
}

interface State {
  minTimeComplete: boolean
}

class RetroReflectPhase extends Component<Props, State> {
  phaseRef = React.createRef<HTMLDivElement>()
  state = {
    minTimeComplete: false
  }
  activityTimeoutId = window.setTimeout(() => {
    this.setState({
      minTimeComplete: true
    })
  }, ms('2m'))

  componentWillUnmount (): void {
    window.clearTimeout(this.activityTimeoutId)
  }

  render () {
    const {atmosphere, team, gotoNext, gotoNextRef, isDemoStageComplete} = this.props
    const {viewerId} = atmosphere
    const {newMeeting} = team
    if (!newMeeting) return
    const {facilitatorUserId, localPhase, id: meetingId, reflectionGroups, localStage} = newMeeting
    const isComplete = localStage ? localStage.isComplete : false
    const reflectPrompts = localPhase!.reflectPrompts!
    const isFacilitating = facilitatorUserId === viewerId
    const nextPhaseLabel = phaseLabelLookup[GROUP]
    const isEmpty = !reflectionGroups || reflectionGroups.length === 0
    const isReadyToGroup =
      !isComplete &&
      !isEmpty &&
      this.state.minTimeComplete &&
      reflectPrompts.reduce(
        (sum, prompt) => sum + (prompt.editorIds ? prompt.editorIds.length : 0),
        0
      ) === 0
    return (
      <React.Fragment>
        <StyledOverflow>
          <StyledWrapper phaseItemCount={reflectPrompts.length} innerRef={this.phaseRef}>
            {reflectPrompts.map((prompt, idx) => (
              <PhaseItemColumn
                key={prompt.id}
                meeting={newMeeting}
                retroPhaseItemId={prompt.id}
                question={prompt.question}
                editorIds={prompt.editorIds}
                description={prompt.description}
                idx={idx}
                phaseRef={this.phaseRef}
              />
            ))}
          </StyledWrapper>
        </StyledOverflow>
        {isFacilitating && (
          <StyledBottomBar>
            <BottomControlSpacer />
            <BottomNavControl
              isBouncing={isDemoStageComplete || isReadyToGroup}
              disabled={isEmpty}
              onClick={gotoNext}
              onKeyDown={handleRightArrow(gotoNext)}
              innerRef={gotoNextRef}
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
        {isDemoRoute() ? (
          <DemoReflectHelpMenu />
        ) : (
          <ReflectHelpMenu floatAboveBottomBar={isFacilitating} />
        )}
      </React.Fragment>
    )
  }
}

graphql`
  fragment RetroReflectPhase_phase on ReflectPhase {
    reflectPrompts {
      id
      question
      description
      editorIds
    }
  }
`

export default createFragmentContainer(
  withAtmosphere(RetroReflectPhase),
  graphql`
    fragment RetroReflectPhase_team on Team {
      newMeeting {
        ...PhaseItemColumn_meeting
        id
        facilitatorUserId
        ... on RetrospectiveMeeting {
          localStage {
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
)
