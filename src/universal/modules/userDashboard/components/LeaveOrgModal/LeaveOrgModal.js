import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import {cashay} from 'cashay';

const LeaveOrgModal = (props) => {
  const {onBackdropClick, orgId, userId} = props;
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
        This will remove you as a billing leader. <br />
        To undo it, you'll have to ask another billing leader to re-add you <br/>
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

LeaveOrgModal.propTypes = {
  onBackdropClick: PropTypes.func.isRequired,
  orgId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired
};

export default LeaveOrgModal;
