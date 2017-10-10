import PropTypes from 'prop-types';
import React from 'react';
import {DashModal} from 'universal/components/Dashboard';
import Button from 'universal/components/Button/Button';
import Type from 'universal/components/Type/Type';
import {cashay} from 'cashay';
import portal from 'react-portal-hoc';

const RemoveFromOrgModal = (props) => {
  const {closeAfter, closePortal, isClosing, orgId, preferredName, userId} = props;
  const handleClick = () => {
    const variables = {orgId, userId};
    cashay.mutate('removeOrgUser', {variables});
  };
  return (
    <DashModal closeAfter={closeAfter} closePortal={closePortal} isClosing={isClosing} onBackdropClick={closePortal}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold marginBottom="1.5rem" scale="s4">
        This will remove {preferredName} from the organization.
        Any outstanding projects will be given to the team leads.
        Any time remaining on their subscription will be refunded on the next invoice.
        <br />
      </Type>
      <Button
        buttonStyle="flat"
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={`Remove ${preferredName}`}
        onClick={handleClick}
        buttonSize="large"
      />
    </DashModal>
  );
};

RemoveFromOrgModal.propTypes = {
  closeAfter: PropTypes.any,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  orgId: PropTypes.string.isRequired,
  preferredName: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
};

export default portal({escToClose: true, closeAfter: 100})(RemoveFromOrgModal);
