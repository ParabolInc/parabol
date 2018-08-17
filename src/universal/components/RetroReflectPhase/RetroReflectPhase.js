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
import {REFLECT, GROUP} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import ScrollableBlock from 'universal/components/ScrollableBlock'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'
import {minWidthMediaQueries} from 'universal/styles/breakpoints'
import {meetingHelpWithBottomBar} from 'universal/styles/meeting'
import HelpMenu from 'universal/components/HelpMenu'
import MeetingHelpMenuLayout from 'universal/components/MeetingHelpMenuLayout'
import makeExternalLink from 'universal/utils/makeExternalLink'

const StyledWrapper = styled(MeetingPhaseWrapper)({
  // TODO: base wrapper on min-width of card columns, not this styled div (TA)
  minWidth: '45rem',
  padding: '0 .75rem',
  [minWidthMediaQueries[2]]: {
    padding: '0 4rem'
  }
})

const StyledMeetingHelpMenuLayout = styled(MeetingHelpMenuLayout)(({isFacilitating}) => ({
  bottom: isFacilitating && meetingHelpWithBottomBar
}))

const learnMoreLink = makeExternalLink(
  'Learn More',
  'https://www.parabol.co/getting-started-guide/retrospective-meetings-101#reflect'
)

const helpMenuContent = (
  <div>
    <p>{'The goal of this phase is to gather honest input from the team.'}</p>
    <p>{'As a group, reflect on projects for a specific timeframe.'}</p>
    <p>
      {
        'Reflection cards will remain blurred from other teammates until everyone has completed the phase.'
      }
    </p>
    <p>{learnMoreLink}</p>
  </div>
)

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
        <StyledWrapper>
          {phaseItems.map((phaseItem) => (
            <PhaseItemColumn meeting={newMeeting} key={phaseItem.id} retroPhaseItem={phaseItem} />
          ))}
        </StyledWrapper>
      </ScrollableBlock>
      {isFacilitating && (
        <MeetingControlBar>
          <FlatButton
            size='medium'
            disabled={!reflectionGroups || reflectionGroups.length === 0}
            onClick={gotoNext}
          >
            <IconLabel
              icon='arrow-circle-right'
              iconAfter
              iconColor='warm'
              iconLarge
              label={`Done! Let’s ${nextPhaseLabel}`}
            />
          </FlatButton>
        </MeetingControlBar>
      )}
      <StyledMeetingHelpMenuLayout isFacilitating={isFacilitating}>
        <HelpMenu heading={phaseLabelLookup[REFLECT]} content={helpMenuContent} />
      </StyledMeetingHelpMenuLayout>
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
