/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 * @flow
 */
import React from 'react';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';
import type {RetroReflectPhase_team as Team} from './__generated__/RetroReflectPhase_team.graphql';
import PhaseItemColumn from 'universal/components/RetroReflectPhase/PhaseItemColumn';

type Props = {
  team: Team,
};

const ReflectPhaseWrapper = styled('div')({
  height: '100%',
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%'
});

const RetroReflectPhase = ({team}: Props) => {
  const {newMeeting, meetingSettings} = team;
  const phaseItems = meetingSettings.phaseItems || [];
  return (
    <ReflectPhaseWrapper>
      {phaseItems.map((phaseItem) =>
        <PhaseItemColumn meeting={newMeeting} key={phaseItem.id} retroPhaseItem={phaseItem} />
      )}
    </ReflectPhaseWrapper>
  );
};

export default createFragmentContainer(
  RetroReflectPhase,
  graphql`
    fragment RetroReflectPhase_team on Team {
      newMeeting {
        ...ReflectionPhaseColumn_meeting
      }
      meetingSettings(meetingType: $meetingType) {
        ... on RetrospectiveMeetingSettings {
          phaseItems {
            ... on RetroPhaseItem {
              id
              ...ReflectionPhaseColumn_retroPhaseItem
            }
          }
        }
      }
    }
  `
);
