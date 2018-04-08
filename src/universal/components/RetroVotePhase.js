/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 * @flow
 */
import * as React from 'react';
import styled from 'react-emotion';
// import type {RetroVotePhase_team as Team} from './__generated__/RetroVotePhase_team.graphql';
import PhaseItemColumn from 'universal/components/RetroReflectPhase/PhaseItemColumn';
import {createFragmentContainer} from 'react-relay';
import {DragDropContext} from 'react-beautiful-dnd';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar';
import Button from 'universal/components/Button/Button';

const {Component} = React;

type Props = {
  atmosphere: Object,
  gotoNext: () => void,
  // flow or relay-compiler is getting really confused here, so I don't use the flow type here
  team: Object,
};

const VotePhaseWrapper = styled('div')({
  display: 'flex',
  height: '100%',
  justifyContent: 'space-around',
  width: '100%'
});

class RetroVotePhase extends Component<Props> {
  render() {
    const {atmosphere: {viewerId}, gotoNext, team} = this.props;
    const {newMeeting, meetingSettings} = team;
    const {facilitatorUserId} = newMeeting || {};
    const phaseItems = meetingSettings.phaseItems || [];
    const isFacilitating = facilitatorUserId === viewerId;
    return (
      <React.Fragment>
          <VotePhaseWrapper>
            {phaseItems.map((phaseItem) =>
              <PhaseItemColumn meeting={newMeeting} key={phaseItem.id} retroPhaseItem={phaseItem} />
            )}
          </VotePhaseWrapper>
        {isFacilitating &&
        <MeetingControlBar>
          <Button
            buttonSize="medium"
            buttonStyle="flat"
            colorPalette="dark"
            icon="arrow-circle-right"
            iconLarge
            iconPalette="warm"
            iconPlacement="right"
            label={'Done! Let’s Discuss'}
            onClick={gotoNext}
          />
        </MeetingControlBar>
        }
      </React.Fragment>
    );
  }
}

export default createFragmentContainer(
  withAtmosphere(RetroVotePhase),
  graphql`
    fragment RetroVotePhase_team on Team {
      newMeeting {
        meetingId: id
        facilitatorUserId
        ...PhaseItemColumn_meeting
        ... on RetrospectiveMeeting {
          votesRemaining
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
);
