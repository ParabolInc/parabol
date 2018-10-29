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
import EndMeetingButton from '../EndMeetingButton'

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
  team: RetroReflectPhase_team
}

class RetroReflectPhase extends Component<Props> {
  phaseRef = React.createRef<HTMLDivElement>()

  render () {
    const {
      atmosphere: {viewerId},
      team,
      gotoNext,
      gotoNextRef
    } = this.props
    const {newMeeting} = team
    if (!newMeeting) return
    const {facilitatorUserId, localPhase, meetingId, reflectionGroups} = newMeeting
    const reflectPrompts = localPhase!.reflectPrompts!
    const isFacilitating = facilitatorUserId === viewerId
    const nextPhaseLabel = phaseLabelLookup[GROUP]
    return (
      <React.Fragment>
        <StyledOverflow>
          <StyledWrapper phaseItemCount={reflectPrompts.length} innerRef={this.phaseRef}>
            {reflectPrompts.map((prompt, idx) => (
              <PhaseItemColumn
                key={prompt.retroPhaseItemId}
                meeting={newMeeting}
                retroPhaseItemId={prompt.retroPhaseItemId}
                question={prompt.question}
                editorIds={prompt.editorIds}
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
              disabled={!reflectionGroups || reflectionGroups.length === 0}
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
        <ReflectHelpMenu floatAboveBottomBar={isFacilitating} />
      </React.Fragment>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(RetroReflectPhase),
  graphql`
    fragment RetroReflectPhase_team on Team {
      newMeeting {
        ...PhaseItemColumn_meeting
        meetingId: id
        facilitatorUserId
        ... on RetrospectiveMeeting {
          reflectionGroups {
            id
          }
          localPhase {
            ... on ReflectPhase {
              reflectPrompts {
                retroPhaseItemId: id
                question
                editorIds
              }
            }
          }
          phases {
            ... on ReflectPhase {
              reflectPrompts {
                retroPhaseItemId: id
                question
                editorIds
              }
            }
          }
        }
      }
    }
  `
)
