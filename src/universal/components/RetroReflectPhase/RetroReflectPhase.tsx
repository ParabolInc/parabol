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
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {GROUP} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import {REFLECTION_WIDTH} from 'universal/utils/multiplayerMasonry/masonryConstants'
import Overflow from 'universal/components/Overflow'

const minWidth = REFLECTION_WIDTH + 32

const StyledWrapper = styled(MeetingPhaseWrapper)(({phaseItemCount}: {phaseItemCount: number}) => ({
  minWidth: phaseItemCount * minWidth
}))

interface Props extends WithAtmosphereProps {
  gotoNext: () => void
  team: RetroReflectPhase_team
}

class RetroReflectPhase extends Component<Props> {
  phaseRef = React.createRef<HTMLDivElement>()

  render() {
    const {
      atmosphere: {viewerId},
      team,
      gotoNext
    } = this.props
    const {newMeeting, meetingSettings} = team
    if (!newMeeting) return
    const {facilitatorUserId, reflectionGroups} = newMeeting
    const phaseItems = meetingSettings.phaseItems || []
    const isFacilitating = facilitatorUserId === viewerId
    const nextPhaseLabel = phaseLabelLookup[GROUP]
    return (
      <React.Fragment>
        <Overflow>
          <StyledWrapper phaseItemCount={phaseItems.length} innerRef={this.phaseRef}>
            {phaseItems.map((phaseItem, idx) => (
              <PhaseItemColumn
                meeting={newMeeting}
                key={phaseItem.id}
                retroPhaseItem={phaseItem}
                idx={idx}
                phaseRef={this.phaseRef}
              />
            ))}
          </StyledWrapper>
        </Overflow>
        {isFacilitating && (
          <MeetingControlBar>
            <FlatButton
              size="medium"
              disabled={!reflectionGroups || reflectionGroups.length === 0}
              onClick={gotoNext}
            >
              <IconLabel
                icon="arrow-circle-right"
                iconAfter
                iconColor="warm"
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
        }
      }
      meetingSettings(meetingType: $meetingType) {
        ... on RetrospectiveMeetingSettings {
          phaseItems {
            ... on RetroPhaseItem {
              id
              ...PhaseItemColumn_retroPhaseItem
            }
          }
        }
      }
    }
  `
)
