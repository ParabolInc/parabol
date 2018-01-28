import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {MenuItem} from 'universal/modules/menu';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import getIsSoftTeamMember from 'universal/utils/getIsSoftTeamMember';
import AddSoftTeamMember from 'universal/modules/outcomeCard/components/AddSoftTeamMember';

const OutcomeCardAssignMenu = (props) => {
  const {
    atmosphere,
    area,
    closePortal,
    project: {projectId, assignee: {ownerId}},
    viewer: {team: {teamId, softTeamMembers, teamMembers}}
  } = props;

  const handleProjectUpdate = (newOwner) => {
    if (newOwner === ownerId) {
      return;
    }
    const {userId} = fromTeamMemberId(newOwner);
    const updatedProject = {
      id: projectId,
      assigneeId: newOwner,
      isSoftProject: getIsSoftTeamMember(newOwner),
      userId
    };
    UpdateProjectMutation(atmosphere, updatedProject, area);
  };

  return (
    <div>
      {teamMembers
        .filter((teamMember) => teamMember.id !== ownerId)
        .concat(softTeamMembers)
        .map((teamMember) => {
          return (
            <MenuItem
              key={teamMember.id}
              avatar={teamMember.picture}
              isActive={ownerId === teamMember.id}
              label={teamMember.preferredName}
              onClick={() => handleProjectUpdate(teamMember.id)}
              closePortal={closePortal}
            />
          );
        })}
      <AddSoftTeamMember teamId={teamId} />
    </div>
  );
};

OutcomeCardAssignMenu.propTypes = {
  area: PropTypes.string.isRequired,
  atmosphere: PropTypes.object.isRequired,
  closePortal: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired
};

export default createFragmentContainer(
  withAtmosphere(OutcomeCardAssignMenu),
  graphql`
    fragment OutcomeCardAssignMenu_viewer on User {
      team(teamId: $teamId) {
        teamId: id
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
        }
        softTeamMembers {
          id
          preferredName
        }
      }
    }
    fragment OutcomeCardAssignMenu_project on Project {
      projectId: id
      assignee {
        ownerId: id
      }
    }
  `
);
