import React from 'react';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';
import ReflectionPhaseColumn from 'universal/components/RetroReflectPhase/ReflectionPhaseColumn';

import type {RetroGroupPhase_team as Team} from './__generated__/RetroGroupPhase_team.graphql';

type Props = {
  team: Team,
};

const ReflectPhaseWrapper = styled('div')({
  height: '100%',
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%'
});

const RetroGroupPhase = ({team}: Props) => {
  const {newMeeting, meetingSettings} = team;
  if (!meetingSettings.hasOwnProperty('phaseItems')) {
    return null;
  }
  const {phaseItems} = meetingSettings;
  return (
    <ReflectPhaseWrapper>
      {phaseItems && phaseItems.map((phaseItem) =>
        <ReflectionPhaseColumn newMeeting={newMeeting} key={phaseItem.id} retroPhaseItem={phaseItem} team={team} />
      )}
    </ReflectPhaseWrapper>
  );
};

export default createFragmentContainer(
  RetroGroupPhase,
  graphql`
    fragment RetroGroupPhase_team on Team {
      meetingSettings(meetingType: $meetingType) {
        ... on RetrospectiveMeetingSettings {
          phaseItems {
            ... on RetroPhaseItem {
              id
            }
          }
        }
      }
    }
  `
);
