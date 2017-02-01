import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import {cashay} from 'cashay';
import portal from 'react-portal-hoc';

const LeaveTeamModal = (props) => {
  const {closeAfter, closePortal, isClosing, teamLead, teamMemberId} = props;
  const handleClick = () => {
    const variables = {teamMemberId};
    cashay.mutate('removeTeamMember', {variables});
    closePortal();
  };
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold scale="s4">
        This will remove you from the team. <br />
        All of your projects will be given to {teamLead} <br />

      </Type>
      <IconLink
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={'Leave the team'}
        margin="1.5rem 0 0"
        onClick={handleClick}
        scale="large"
      />
    </DashModal>
  );
};

LeaveTeamModal.propTypes = {
  onBackdropClick: PropTypes.func,
  teamLead: PropTypes.string.isRequired,
  teamMemberId: PropTypes.string.isRequired
};

export default portal({escToClose: true, closeAfter: 100})(LeaveTeamModal);
