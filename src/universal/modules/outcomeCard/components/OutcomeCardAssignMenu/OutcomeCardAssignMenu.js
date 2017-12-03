import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {MenuItem} from 'universal/modules/menu';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

const OutcomeCardAssignMenu = (props) => {
  const {
    atmosphere,
    area,
    closePortal,
    project: {projectId, teamMember: {ownerId}, team: {teamMembers}}
  } = props;

  const handleProjectUpdate = (newOwner) => {
    if (newOwner === ownerId) {
      return;
    }
    const {userId} = fromTeamMemberId(newOwner);
    const updatedProject = {
      id: projectId,
      userId
    };
    UpdateProjectMutation(atmosphere, updatedProject, area);
  };

  const itemFactory = () => {
    return teamMembers
      .filter((teamMember) => teamMember.id !== ownerId)
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
      });
  };

  return (
    <div>
      {itemFactory()}
    </div>
  );
};

OutcomeCardAssignMenu.propTypes = {
  area: PropTypes.string.isRequired,
  atmosphere: PropTypes.object.isRequired,
  closePortal: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired
};

export default createFragmentContainer(
  withAtmosphere(OutcomeCardAssignMenu),
  graphql`
    fragment OutcomeCardAssignMenu_project on Project {
      projectId: id
      team {
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
          teamId
          userId
        }
      }
      teamMember {
        ownerId: id
      }
    }
  `
);
