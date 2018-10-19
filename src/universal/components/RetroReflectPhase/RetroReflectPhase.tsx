import {RetroReflectPhase_team} from '__generated__/RetroReflectPhase_team.graphql'
/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
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
import LoadableModal from 'universal/components/LoadableModal'
import DemoKickoffModalLoadable from 'universal/components/DemoKickoffModalLoadable'

const minWidth = REFLECTION_WIDTH + 32

const StyledWrapper = styled(MeetingPhaseWrapper)(({phaseItemCount}: {phaseItemCount: number}) => ({
  minWidth: phaseItemCount * minWidth
}))

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
    const {facilitatorUserId, localPhase, reflectionGroups} = newMeeting
    const reflectPrompts = localPhase!.reflectPrompts!
    const isFacilitating = facilitatorUserId === viewerId
    const nextPhaseLabel = phaseLabelLookup[GROUP]
    const isOpen = true
    return (
      <React.Fragment>
        <LoadableModal
          LoadableComponent={DemoKickoffModalLoadable}
          queryVars={{isOpen}}
          toggle={<div>toggle</div>}
        />
        <Overflow>
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
        </Overflow>
        {isFacilitating && (
          <MeetingControlBar>
            <FlatButton
              size='medium'
              disabled={!reflectionGroups || reflectionGroups.length === 0}
              onClick={gotoNext}
              onKeyDown={handleRightArrow(gotoNext)}
              innerRef={gotoNextRef}
            >
              <IconLabel
                icon='arrow_forward'
                iconAfter
                iconColor='warm'
                iconLarge
                label={`Done! Let’s ${nextPhaseLabel}`}
              />
            </FlatButton>
          </MeetingControlBar>
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
