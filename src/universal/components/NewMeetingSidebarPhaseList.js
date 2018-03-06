// @flow
import React from 'react';
import {LOBBY} from 'universal/utils/constants';
import styled from 'react-emotion';
import romanNumeral from 'roman-numeral';
import NewMeetingSidebarPhaseListItem from 'universal/components/NewMeetingSidebarPhaseListItem';
import {createFragmentContainer, graphql} from 'react-relay';
import {withRouter} from 'react-router-dom';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {phaseLabelLookup, phasesToExclude, phaseTypeToPhaseGroup} from 'universal/utils/meetings/lookups';

import type {NewMeetingPhaseTypeEnum} from 'universal/types/schema.flow';
import type {NewMeetingSidebarPhaseList_viewer as Viewer} from './__generated__/NewMeetingSidebarPhaseList_viewer.graphql';

const NavList = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0
});

const isNavigable = (group, stages, isFacilitator) => {
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
  const {atmosphere: {viewerId}, localPhase, viewer: {team: {meetingSettings: {phases}, newMeeting}}} = props;
  const {facilitatorUserId} = newMeeting || {};
  const stages = newMeeting && newMeeting.stages || [];
  const localGroup = phaseTypeToPhaseGroup[localPhase];
  const facilitatorStage = stages.find((stage) => stage.isFacilitatorStage);
  const facilitatorPhaseGroup = facilitatorStage ? phaseTypeToPhaseGroup[facilitatorStage.type] : LOBBY;
  const isFacilitator = facilitatorUserId === viewerId;
  return (
    <NavList>
      {phases
        .filter((phase) => !phasesToExclude.includes(phase))
        .map((name, idx) => {
          return (<NewMeetingSidebarPhaseListItem
            key={name}
            name={phaseLabelLookup[name]}
            listPrefix={`${romanNumeral.convert(idx + 1)}.`}
            isActive={localGroup === name}
            isFacilitatorPhaseGroup={facilitatorPhaseGroup === name}
            isNavigable={isNavigable(name, stages, isFacilitator)}
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
          phases
        }
        newMeeting {
          facilitatorUserId
          stages {
            isComplete
            isFacilitatorStage
            type
          }
        }
      }
    }
  `
);
