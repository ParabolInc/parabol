import PropTypes from 'prop-types';
import React from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import {cashay} from 'cashay';
import portal from 'react-portal-hoc';

const LeaveOrgModal = (props) => {
  const {closeAfter, closePortal, isClosing, orgId, userId} = props;
  const handleClick = () => {
    const variables = {orgId, userId};
    cashay.mutate('removeOrgUser', {variables});
  };
  const undoStr = 'To undo it, you’ll have to ask another Billing Leader to re-add you';
  return (
    <DashModal closeAfter={closeAfter} closePortal={closePortal} isClosing={isClosing} onBackdropClick={closePortal}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold marginBottom="1.5rem" scale="s4">
        This will remove you from the organization and all teams under it! <br />
        {undoStr}<br />
      </Type>
      <Button
        buttonStyle="flat"
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={'Leave the organization'}
        onClick={handleClick}
        buttonSize="large"
      />
    </DashModal>
  );
};

LeaveOrgModal.propTypes = {
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  onBackdropClick: PropTypes.func.isRequired,
  orgId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
};

export default portal({escToClose: true, closeAfter: 100})(LeaveOrgModal);
