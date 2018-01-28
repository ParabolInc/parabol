import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {MenuItem} from 'universal/modules/menu';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import AddSoftTeamMember from 'universal/modules/outcomeCard/components/AddSoftTeamMember';
import avatarUser from 'universal/styles/theme/images/avatar-user.svg';

const OutcomeCardAssignMenu = (props) => {
  const {
    atmosphere,
    area,
    closePortal,
    project: {projectId, assignee: {ownerId}},
    viewer: {team}
  } = props;
  const {softTeamMembers, teamMembers} = team;
  const handleProjectUpdate = (newOwner) => {
    if (newOwner === ownerId) {
      return;
    }
    const updatedProject = {
      id: projectId,
      assigneeId: newOwner
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
              avatar={teamMember.picture || avatarUser}
              isActive={ownerId === teamMember.id}
              label={teamMember.preferredName}
              onClick={() => handleProjectUpdate(teamMember.id)}
              closePortal={closePortal}
            />
          );
        })}
      <AddSoftTeamMember area={area} closePortal={closePortal} projectId={projectId} team={team} />
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
        ...AddSoftTeamMember_team
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
