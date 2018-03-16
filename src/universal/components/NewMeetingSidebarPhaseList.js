// @flow
import React from 'react';
import {LOBBY} from 'universal/utils/constants';
import styled from 'react-emotion';
import NewMeetingSidebarPhaseListItem from 'universal/components/NewMeetingSidebarPhaseListItem';
import {createFragmentContainer, graphql} from 'react-relay';
import {withRouter} from 'react-router-dom';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {phaseLabelLookup, phaseTypeToPhaseGroup} from 'universal/utils/meetings/lookups';

import type {NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';
import type {NewMeetingSidebarPhaseList_viewer as Viewer} from './__generated__/NewMeetingSidebarPhaseList_viewer.graphql';
import findStageById from 'universal/utils/meetings/findStageById';

const NavList = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0
});

const isNavigable = (group, stages, isFacilitator) => {
  // FIXME
  return false;
  const firstStageIdxInGroup = stages.findIndex((stage) => phaseTypeToPhaseGroup[stage.type] === group);
  const currentStageIdx = stages.findIndex((stage) => stage.isComplete);
  if (!isFacilitator) {
    return firstStageIdxInGroup <= currentStageIdx;
  }
  const nextStageIdxInGroup = stages
    .findIndex((stage, idx) => idx > firstStageIdxInGroup && phaseTypeToPhaseGroup[stage.type] !== group);
  return firstStageIdxInGroup <= nextStageIdxInGroup;
};

type Props = {
  atmosphere: Object,
  localPhase: NewMeetingPhaseTypeEnum,
  viewer: Viewer
}

const NewMeetingSidebarPhaseList = (props: Props) => {
  const {atmosphere: {viewerId}, localPhase, viewer: {team: {meetingSettings: {phaseTypes}, newMeeting}}} = props;
  const {facilitatorUserId, facilitatorStageId, phases = []} = newMeeting || {};
  const localGroup = phaseTypeToPhaseGroup[localPhase];
  const stageRes = findStageById(phases, facilitatorStageId);
  const facilitatorPhaseGroup = stageRes ? phaseTypeToPhaseGroup[stageRes.phase.phaseType] : LOBBY;
  const isFacilitator = facilitatorUserId === viewerId;
  return (
    <NavList>
      {phaseTypes
        .map((name, idx) => {
          return (<NewMeetingSidebarPhaseListItem
            key={name}
            name={phaseLabelLookup[name]}
            listPrefix={String(idx + 1)}
            isActive={localGroup === name}
            isFacilitatorPhaseGroup={facilitatorPhaseGroup === name}
            isNavigable={isNavigable(name, phases, isFacilitator)}
            handleClick={() => {}}
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
          phases {
            phaseType
            stages {
              isComplete
            }
          }
        }
      }
    }
  `
);
