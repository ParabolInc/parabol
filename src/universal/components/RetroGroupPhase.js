/**
 * Renders the UI for the reflection phase of the retrospective meeting
 *
 * @flow
 */
import React from 'react';
import styled from 'react-emotion';
import {createFragmentContainer} from 'react-relay';
import type {RetroGroupPhase_team as Team} from './__generated__/RetroGroupPhase_team.graphql';
import ReflectionPhaseColumn from 'universal/components/RetroReflectPhase/ReflectionPhaseColumn';

type Props = {
  team: Team,
};

const GroupPhaseWrapper = styled('div')({
  height: '100%',
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%'
});

const RetroGroupPhase = ({team}: Props) => {
  const {newMeeting, meetingSettings} = team;
  const phaseItems = meetingSettings.phaseItems || [];
  return (
    <GroupPhaseWrapper>
      {phaseItems.map((phaseItem) =>
        <ReflectionPhaseColumn meeting={newMeeting} key={phaseItem.id} retroPhaseItem={phaseItem} />
      )}
    </GroupPhaseWrapper>
  );
};

export default createFragmentContainer(
  RetroGroupPhase,
  graphql`
    fragment RetroGroupPhase_team on Team {
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
