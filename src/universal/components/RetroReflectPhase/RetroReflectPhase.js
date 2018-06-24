/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 * @flow
 */
import * as React from 'react'
import {createFragmentContainer} from 'react-relay'
import type {RetroReflectPhase_team as Team} from './__generated__/RetroReflectPhase_team.graphql'
import PhaseItemColumn from 'universal/components/RetroReflectPhase/PhaseItemColumn'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {GROUP} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import ScrollableBlock from 'universal/components/ScrollableBlock'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import Button from 'universal/components/Button/Button'

type Props = {
  atmosphere: Object,
  gotoNext: () => void,
  team: Team
}

const RetroReflectPhase = (props: Props) => {
  const {
    atmosphere: {viewerId},
    team,
    gotoNext
  } = props
  const {newMeeting, meetingSettings} = team
  const {facilitatorUserId, reflectionGroups} = newMeeting || {}
  const phaseItems = meetingSettings.phaseItems || []
  const isFacilitating = facilitatorUserId === viewerId
  const nextPhaseLabel = phaseLabelLookup[GROUP]
  return (
    <React.Fragment>
      <ScrollableBlock>
        <MeetingPhaseWrapper>
          {phaseItems.map((phaseItem) => (
            <PhaseItemColumn meeting={newMeeting} key={phaseItem.id} retroPhaseItem={phaseItem} />
          ))}
        </MeetingPhaseWrapper>
      </ScrollableBlock>
      {isFacilitating && (
        <MeetingControlBar>
          <Button
            buttonSize='medium'
            buttonStyle='flat'
            colorPalette='dark'
            disabled={!reflectionGroups || reflectionGroups.length === 0}
            icon='arrow-circle-right'
            iconLarge
            iconPalette='warm'
            iconPlacement='right'
            label={`Done! Let’s ${nextPhaseLabel}`}
            onClick={gotoNext}
          />
        </MeetingControlBar>
      )}
    </React.Fragment>
  )
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
