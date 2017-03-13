import React, {PropTypes} from 'react';
import {DashModal} from 'universal/components/Dashboard';
import IconLink from 'universal/components/IconLink/IconLink';
import Type from 'universal/components/Type/Type';
import {cashay} from 'cashay';
import portal from 'react-portal-hoc';

const LeaveOrgModal = (props) => {
  const {closeAfter, closePortal, isClosing, orgId, userId} = props;
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
        This will remove you from the organization and all teams under it! <br />
        To undo it, you'll have to ask another Billing Leader to re-add you <br/>
      </Type>
      <IconLink
        colorPalette="warm"
        icon="arrow-circle-right"
        iconPlacement="right"
        label={'Leave the organization'}
        margin="1.5rem 0 0"
        onClick={handleClick}
        scale="large"
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
