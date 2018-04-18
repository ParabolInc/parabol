// @flow
import * as React from 'react';
import styled from 'react-emotion';
import PhaseItemColumn from 'universal/components/RetroReflectPhase/PhaseItemColumn';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar';
import {Button} from 'universal/components';
import ui from 'universal/styles/ui';

type Props = {|
  atmosphere: Object,
  gotoNext: () => void,
  // flow or relay-compiler is getting really confused here, so I don't use the flow type here
  team: Object,
|};

const VotePhaseWrapper = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  justifyContent: 'space-around',
  margin: '0 auto',
  maxWidth: ui.meetingTopicPhaseMaxWidth,
  overflowY: 'scroll',
  width: '100%'
});

const RetroVotePhase = (props: Props) => {
  const {atmosphere: {viewerId}, gotoNext, team} = props;
  const {newMeeting, meetingSettings, teamMembers} = team;
  const {facilitatorUserId, votesRemaining} = newMeeting || {};
  const {phaseItems = [], totalVotes} = meetingSettings;
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
          disabled={votesRemaining === totalVotes * teamMembers.length}
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
};

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
          totalVotes
          phaseItems {
            ... on RetroPhaseItem {
              id
              ...PhaseItemColumn_retroPhaseItem
            }
          }
        }
      }
    teamMembers(sortBy: "checkInOrder") {
      id
    }
    }
  `
);
