import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
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
      <Type align="center" bold scale="s4">
        This will remove {preferredName} from all teams and the organization.<br />
        Your next invoice will be refunded a prorated amount for unused time.<br />
      </Type>
      <IconLink
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={`Remove ${preferredName}`}
        margin="1.5rem 0 0"
        onClick={handleClick}
        scale="large"
      />
    </DashModal>
  );
};

RemoveFromOrgModal.propTypes = {
  orgId: PropTypes.string.isRequired,
  preferredName: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
};

export default portal({escToClose: true, closeAfter: 100})(RemoveFromOrgModal);
