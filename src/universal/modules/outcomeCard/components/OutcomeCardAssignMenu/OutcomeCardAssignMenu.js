import PropTypes from 'prop-types';
import React from 'react';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {MenuItem} from 'universal/modules/menu';
import UpdateProjectMutation from 'universal/mutations/UpdateProjectMutation';

const OutcomeCardAssignMenu = (props) => {
  const {
    atmosphere,
    area,
    closePortal,
    projectId,
    ownerId,
    teamMembers
  } = props;

  const handleProjectUpdate = (newOwner) => {
    if (newOwner === ownerId) {
      return;
    }
    const updatedProject = {
      id: projectId,
      teamMemberId: newOwner
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
  projectId: PropTypes.string.isRequired,
  ownerId: PropTypes.string.isRequired,
  teamMembers: PropTypes.array.isRequired
};

export default withAtmosphere(OutcomeCardAssignMenu);
