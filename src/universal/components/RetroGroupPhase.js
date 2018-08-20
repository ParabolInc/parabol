/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 * @flow
 */
import * as React from 'react'
import {createFragmentContainer} from 'react-relay'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import PhaseItemMasonry from 'universal/components/PhaseItemMasonry'
import StyledError from 'universal/components/StyledError'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import AutoGroupReflectionsMutation from 'universal/mutations/AutoGroupReflectionsMutation'
import {GROUP, VOTE} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import type {MutationProps} from 'universal/utils/relay/withMutationProps'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'

import {meetingHelpWithBottomBar} from 'universal/styles/meeting'
import HelpMenu from 'universal/components/HelpMenu'
import MeetingHelpMenuLayout from 'universal/components/MeetingHelpMenuLayout'
import makeExternalLink from 'universal/utils/makeExternalLink'
import styled from 'react-emotion'

type Props = {
  atmosphere: Object,
  gotoNext: () => void,
  // flow or relay-compiler is getting really confused here, so I don't use the flow type here
  team: Object,
  ...MutationProps
}

const StyledMeetingHelpMenuLayout = styled(MeetingHelpMenuLayout)(({isFacilitating}) => ({
  bottom: isFacilitating && meetingHelpWithBottomBar
}))

const groupHelpContent = (
  <div>
    <p>{'The goal of this phase is to identify common themes and group them for discussion.'}</p>
    <p>{'To group, simply drag and drop a card onto another card or group.'}</p>
    <p>
      {makeExternalLink(
        'Learn More',
        'https://www.parabol.co/getting-started-guide/retrospective-meetings-101#group'
      )}
    </p>
  </div>
)

const RetroGroupPhase = (props: Props) => {
  const {atmosphere, error, gotoNext, onError, onCompleted, submitMutation, team} = props
  const {viewerId} = atmosphere
  const {newMeeting} = team
  const {nextAutoGroupThreshold, facilitatorUserId, meetingId} = newMeeting || {}
  const isFacilitating = facilitatorUserId === viewerId
  const nextPhaseLabel = phaseLabelLookup[VOTE]
  const autoGroup = () => {
    submitMutation()
    const groupingThreshold = nextAutoGroupThreshold || 0.5
    AutoGroupReflectionsMutation(atmosphere, {meetingId, groupingThreshold}, onError, onCompleted)
  }
  const canAutoGroup = !nextAutoGroupThreshold || nextAutoGroupThreshold < 1
  return (
    <React.Fragment>
      {error && <StyledError>{error.message}</StyledError>}
      <MeetingPhaseWrapper>
        <PhaseItemMasonry meeting={newMeeting} />
      </MeetingPhaseWrapper>
      {isFacilitating && (
        <MeetingControlBar>
          <FlatButton size='medium' onClick={gotoNext}>
            <IconLabel
              icon='arrow-circle-right'
              iconAfter
              iconColor='warm'
              iconLarge
              label={`Done! Let’s ${nextPhaseLabel}`}
            />
          </FlatButton>
          {canAutoGroup && (
            <FlatButton size='medium' onClick={autoGroup}>
              <IconLabel icon='magic' iconColor='midGray' iconLarge label={'Auto Group'} />
            </FlatButton>
          )}
        </MeetingControlBar>
      )}
      <StyledMeetingHelpMenuLayout isFacilitating={isFacilitating}>
        <HelpMenu heading={phaseLabelLookup[GROUP]} content={groupHelpContent} />
      </StyledMeetingHelpMenuLayout>
    </React.Fragment>
  )
}

export default createFragmentContainer(
  withMutationProps(withAtmosphere(RetroGroupPhase)),
  graphql`
    fragment RetroGroupPhase_team on Team {
      newMeeting {
        meetingId: id
        facilitatorUserId
        ...PhaseItemColumn_meeting
        ... on RetrospectiveMeeting {
          ...PhaseItemMasonry_meeting
          nextAutoGroupThreshold
          reflectionGroups {
            id
            meetingId
            sortOrder
            retroPhaseItemId
            reflections {
              id
              retroPhaseItemId
              sortOrder
            }
          }
        }
      }
    }
  `
)
