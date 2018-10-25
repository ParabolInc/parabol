/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 */
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper'
import StyledError from 'universal/components/StyledError'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar'
import AutoGroupReflectionsMutation from 'universal/mutations/AutoGroupReflectionsMutation'
import {VOTE} from 'universal/utils/constants'
import {phaseLabelLookup} from 'universal/utils/meetings/lookups'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import GroupHelpMenu from 'universal/components/MeetingHelp/GroupHelpMenu'
import {RetroGroupPhase_team} from '__generated__/RetroGroupPhase_team.graphql'
import handleRightArrow from '../utils/handleRightArrow'
import PhaseItemMasonry from './PhaseItemMasonry'
import {isDemoRoute} from 'universal/utils/demo'

interface Props extends WithMutationProps, WithAtmosphereProps {
  gotoNext: () => void
  gotoNextRef: React.RefObject<HTMLDivElement>
  team: RetroGroupPhase_team
}

const BottomControlSpacer = styled('div')({
  minWidth: '6rem'
})

const StyledBottomControl = styled(BottomNavControl)({
  minWidth: '6rem'
})

const StyledBottomBar = styled(MeetingControlBar)({
  justifyContent: 'space-between'
})

const CenteredControlBlock = styled('div')({
  display: 'flex'
})

const RetroGroupPhase = (props: Props) => {
  const {
    atmosphere,
    error,
    gotoNext,
    gotoNextRef,
    onError,
    onCompleted,
    submitting,
    submitMutation,
    team
  } = props
  const {viewerId} = atmosphere
  const {newMeeting} = team
  if (!newMeeting) return null
  const {nextAutoGroupThreshold, facilitatorUserId, meetingId} = newMeeting
  const isFacilitating = facilitatorUserId === viewerId
  const nextPhaseLabel = phaseLabelLookup[VOTE]
  const autoGroup = () => {
    if (submitting) return
    submitMutation()
    const groupingThreshold = nextAutoGroupThreshold || 0.5
    AutoGroupReflectionsMutation(atmosphere, {meetingId, groupingThreshold}, onError, onCompleted)
  }
  const canAutoGroup = !nextAutoGroupThreshold || nextAutoGroupThreshold < 1
  const endMeetingLabel = isDemoRoute ? 'End Demo' : 'End Meeting'
  return (
    <React.Fragment>
      {error && <StyledError>{error}</StyledError>}
      <MeetingPhaseWrapper>
        <PhaseItemMasonry meeting={newMeeting} />
      </MeetingPhaseWrapper>
      {isFacilitating && (
        <StyledBottomBar>
          {/* ControlBlock and div for layout spacing */}
          <BottomControlSpacer />
          <CenteredControlBlock>
            <StyledBottomControl
              onClick={gotoNext}
              onKeyDown={handleRightArrow(gotoNext)}
              innerRef={gotoNextRef}
            >
              <BottomNavIconLabel
                icon='arrow_forward'
                iconColor='warm'
                label={`Next: ${nextPhaseLabel}`}
              />
            </StyledBottomControl>
            {canAutoGroup && (
              <StyledBottomControl onClick={autoGroup} waiting={submitting}>
                <BottomNavIconLabel icon='photo_filter' iconColor='midGray' label={'Auto Group'} />
              </StyledBottomControl>
            )}
          </CenteredControlBlock>
          <StyledBottomControl onClick={() => console.log('End Meeting')} waiting={submitting}>
            <BottomNavIconLabel icon='flag' iconColor='blue' label={endMeetingLabel} />
          </StyledBottomControl>
        </StyledBottomBar>
      )}
      <GroupHelpMenu floatAboveBottomBar={isFacilitating} />
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
