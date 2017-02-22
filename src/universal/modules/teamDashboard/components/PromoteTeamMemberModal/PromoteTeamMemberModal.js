import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import {cashay} from 'cashay';
import portal from 'react-portal-hoc';

const PromoteTeamMemberModal = (props) => {
  const {closeAfter, closePortal, isClosing, preferredName, teamMemberId} = props;
  const handleClick = () => {
    const variables = {teamMemberId};
    cashay.mutate('promoteToLead', {variables});
    closePortal();
  };
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold scale="s4">
        You will be removed as the team leader <br />
        and promote {preferredName}. You will no<br />
        longer be able to change team membership.<br />
        <br />
        This cannot be undone!<br />
      </Type>
      <IconLink
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={`Yes, promote ${preferredName}`}
        margin="1.5rem 0 0"
        onClick={handleClick}
        scale="large"
      />
    </DashModal>
  );
};

PromoteTeamMemberModal.propTypes = {
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  onBackdropClick: PropTypes.func,
  preferredName: PropTypes.string.isRequired,
  teamMemberId: PropTypes.string.isRequired
};

export default portal({escToClose: true, closeAfter: 100})(PromoteTeamMemberModal);
