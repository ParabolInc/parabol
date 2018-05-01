// @flow
import * as React from 'react';
import PhaseItemColumn from 'universal/components/RetroReflectPhase/PhaseItemColumn';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import MeetingControlBar from 'universal/modules/meeting/components/MeetingControlBar/MeetingControlBar';
import {Button} from 'universal/components';
import ScrollableBlock from 'universal/components/ScrollableBlock';
import MeetingPhaseWrapper from 'universal/components/MeetingPhaseWrapper';
import {DISCUSS} from 'universal/utils/constants';

type Props = {|
  atmosphere: Object,
  gotoNext: () => void,
  // flow or relay-compiler is getting really confused here, so I don't use the flow type here
  team: Object,
|};

const RetroVotePhase = (props: Props) => {
  const {atmosphere: {viewerId}, gotoNext, team} = props;
  const {newMeeting, meetingSettings} = team;
  const {facilitatorUserId, phases} = newMeeting || {};
  const {phaseItems = []} = meetingSettings;
  const isFacilitating = facilitatorUserId === viewerId;
  const discussPhase = phases.find((phase) => phase.phaseType === DISCUSS);
  const discussStage = discussPhase.stages[0];
  return (
    <React.Fragment>
      <ScrollableBlock>
        <MeetingPhaseWrapper>
          {phaseItems.map((phaseItem) =>
            <PhaseItemColumn meeting={newMeeting} key={phaseItem.id} retroPhaseItem={phaseItem} />
          )}
        </MeetingPhaseWrapper>
      </ScrollableBlock>
      {isFacilitating &&
      <MeetingControlBar>
        <Button
          buttonSize="medium"
          buttonStyle="flat"
          colorPalette="dark"
          disabled={!discussStage.isNavigableByFacilitator}
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
          phases {
            phaseType
            ... on DiscussPhase {
              stages {
                ... on RetroDiscussStage {
                  id
                  isNavigableByFacilitator
                }
              }
            }
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
);
