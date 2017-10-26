import PropTypes from 'prop-types';
import React from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
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
      <Type align="center" bold marginBottom="1.5rem" scale="s4">
        You will be removed as the team leader <br />
        and promote {preferredName}. You will no<br />
        longer be able to change team membership.<br />
        <br />
        This cannot be undone!<br />
      </Type>
      <Button
        buttonSize="large"
        buttonStyle="flat"
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={`Yes, promote ${preferredName}`}
        onClick={handleClick}
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
