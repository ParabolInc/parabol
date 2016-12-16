import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import {cashay} from 'cashay';

const RemoveBillingLeaderModal = (props) => {
  const {onBackdropClick, orgId, preferredName, userId} = props;
  const handleClick = () => {
    const variables = {orgId, userId};
    cashay.mutate('removeBillingLeader', {variables});
  };
  return (
    <DashModal onBackdropClick={onBackdropClick}>
      <Type align="center" bold marginBottom="1.5rem" scale="s7" colorPalette="cool">
        Are you sure?
      </Type>
      <Type align="center" bold scale="s4">
        This will remove {preferredName} as a billing leader from <br />
        the organization. They will still be a member. <br />
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

RemoveBillingLeaderModal.propTypes = {
  onBackdropClick: PropTypes.func,
  orgId: PropTypes.string.isRequired,
  preferredName: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
};

export default RemoveBillingLeaderModal;
