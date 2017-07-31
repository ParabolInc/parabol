import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React from 'react';
import {MenuItem} from 'universal/modules/menu';

const OutcomeCardAssignMenu = (props) => {
  const {
    closePortal,
    projectId,
    ownerId,
    teamMembers
  } = props;

  const handleProjectUpdate = (newOwner) => {
    if (newOwner === ownerId) {
      return;
    }
    const options = {
      ops: {},
      variables: {
        updatedProject: {
          id: projectId,
          teamMemberId: newOwner
        }
      }
    };
    cashay.mutate('updateProject', options);
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
  closePortal: PropTypes.func.isRequired,
  projectId: PropTypes.string.isRequired,
  ownerId: PropTypes.string.isRequired,
  teamMembers: PropTypes.array.isRequired
};

//const styleThunk = () => ({
//  //root: {
//  //  alignItems: 'center',
//  //  color: appTheme.palette.dark,
//  //  display: 'flex',
//  //  height: '1.5rem',
//  //  fontSize: '13px'
//  //},
//
//  //teamName: {
//    //color: appThe/me.palette.dark,
//    //display: 'inline-block',
//    //fontWeight: 700,
//    //marginLeft: '.5rem'
//  //}
//});

export default OutcomeCardAssignMenu;
