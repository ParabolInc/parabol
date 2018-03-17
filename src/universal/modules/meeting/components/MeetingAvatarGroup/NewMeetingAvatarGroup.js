// @flow
import React from 'react';
import {connect} from 'react-redux';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {createFragmentContainer} from 'react-relay';
import styled from 'react-emotion';
import findStageById from 'universal/utils/meetings/findStageById';
import NewMeetingAvatar from 'universal/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatar';
import type {NewMeetingAvatarGroup_team as Team} from './__generated__/NewMeetingAvatarGroup_team.graphql';

const MeetingAvatarGroupRoot = styled('div')({
  alignItems: 'flex-end',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  padding: '1rem 0'
});

const MeetingAvatarGroupInner = styled('div')({
  display: 'flex',
  position: 'relative',
  textAlign: 'center'
});

type Props = {
  gotoStageId: () => void,
  team: Team
};

const NewMeetingAvatarGroup = (props: Props) => {
  const {gotoStageId, team: {newMeeting = {}, teamMembers}} = props;
  const {facilitatorStageId, phases, localPhase} = newMeeting || {};
  const facilitatorStageRes = findStageById(phases, facilitatorStageId);
  const facilitatorStageTeamMemberId = facilitatorStageRes && facilitatorStageRes.stage.teamMemberId;
  return (
    <MeetingAvatarGroupRoot>
      <MeetingAvatarGroupInner>
        {teamMembers.map((teamMember) => (
          <NewMeetingAvatar
            key={teamMember.id}
            gotoStageId={gotoStageId}
            isFacilitatorStage={facilitatorStageTeamMemberId === teamMember.id}
            newMeeting={newMeeting}
            stage={localPhase.stages.find((stage) => stage.teamMemberId === teamMember.id)}
            teamMember={teamMember}
          />)
        )}
      </MeetingAvatarGroupInner>
    </MeetingAvatarGroupRoot>
  );
};

export default createFragmentContainer(
  connect()(withAtmosphere(NewMeetingAvatarGroup)),
  graphql`
    fragment NewMeetingAvatarGroup_team on Team {
      teamId: id
      teamMembers(sortBy: "checkInOrder") {
        id
        isCheckedIn
        isConnected
        isSelf
        picture
        ...MeetingAvatarMenu_avatar
      }
      newMeeting {
        facilitatorStageId
        localPhase {
          id
          phaseType
          stages {
            ... on CheckInStage {
              teamMemberId
              ...NewMeetingAvatar_stage
            }
          }
        }
        localStage {
          ...on CheckInStage {
            teamMemberId
          }
        }
        phases {
          phaseType
          stages {
            ... on CheckInStage {
              teamMemberId
            }
            id
          }
        }
        ...NewMeetingAvatar_newMeeting
      }
    }`
);
