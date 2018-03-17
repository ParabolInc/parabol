// @flow
import React from 'react';
import {LOBBY} from 'universal/utils/constants';
import styled from 'react-emotion';
import NewMeetingSidebarPhaseListItem from 'universal/components/NewMeetingSidebarPhaseListItem';
import {createFragmentContainer, graphql} from 'react-relay';
import {withRouter} from 'react-router-dom';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {phaseLabelLookup, phaseTypeToPhaseGroup} from 'universal/utils/meetings/lookups';
import type {NewMeetingSidebarPhaseList_viewer as Viewer} from './__generated__/NewMeetingSidebarPhaseList_viewer.graphql';
import findStageById from 'universal/utils/meetings/findStageById';
import getIsNavigable from 'universal/utils/meetings/getIsNavigable';

const NavList = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0
});

type Props = {
  atmosphere: Object,
  gotoStageId: (stageId: string) => void,
  viewer: Viewer
}

const getItemStage = (name: string, phases: $ReadOnlyArray<Object>, facilitatorStageId: string) => {
  const stageRes = findStageById(phases, facilitatorStageId);
  if (!stageRes) return undefined;
  const {stage, phase} = stageRes;
  if (phase.phaseType === name) {
    return stage;
  }
  const itemPhase = phases.find(({phaseType}) => phaseType === name);
  return itemPhase && itemPhase.stages[0];
};

const NewMeetingSidebarPhaseList = (props: Props) => {
  const {atmosphere: {viewerId}, gotoStageId, viewer: {team: {meetingSettings: {phaseTypes}, newMeeting}}} = props;
  const {facilitatorUserId, facilitatorStageId, localPhase = {}, phases = []} = newMeeting || {};
  const {phaseType} = localPhase;
  const localGroup = phaseTypeToPhaseGroup[phaseType];
  const facilitatorStageRes = findStageById(phases, facilitatorStageId);
  const {phase: facilitatorPhase = {phaseType: LOBBY}} = facilitatorStageRes || {};
  const facilitatorPhaseGroup = phaseTypeToPhaseGroup[facilitatorPhase.phaseType];
  const isViewerFacilitator = facilitatorUserId === viewerId;
  return (
    <NavList>
      {phaseTypes
        .map((name, idx) => {
          const itemStage = getItemStage(name, phases, facilitatorStageId);
          const itemStageId = itemStage && itemStage.id || '';
          const isNavigable = getIsNavigable(isViewerFacilitator, phases, itemStageId);
          const handleClick = isNavigable ? () => gotoStageId(itemStageId) : undefined;
          return (<NewMeetingSidebarPhaseListItem
            key={name}
            name={phaseLabelLookup[name]}
            listPrefix={String(idx + 1)}
            isActive={localGroup === name}
            isFacilitatorPhaseGroup={facilitatorPhaseGroup === name}
            handleClick={handleClick}
          />);
        })}
    </NavList>
  );
};

export default createFragmentContainer(
  withAtmosphere(withRouter(NewMeetingSidebarPhaseList)),
  graphql`
    fragment NewMeetingSidebarPhaseList_viewer on User {
      team(teamId: $teamId) {
        meetingSettings(meetingType: $meetingType) {
          phaseTypes
        }
        newMeeting {
          facilitatorUserId
          facilitatorStageId
          localPhase {
            phaseType
          }
          phases {
            phaseType
            stages {
              id
              isComplete
            }
          }
        }
      }
    }
  `
);
