import React, {PropTypes} from 'react';
import {
  TOGGLE_REMOVE_BILLING_LEADER,
  TOGGLE_LEAVE_ORG,
} from 'universal/modules/userDashboard/ducks/orgSettingsDuck';
import RemoveBillingLeaderModal from 'universal/modules/userDashboard/components/RemoveBillingLeaderModal/RemoveBillingLeaderModal';
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal';
import {toggleLeaveModal, toggleRemoveModal} from 'universal/modules/userDashboard/ducks/orgSettingsDuck';

const SettingsModal = (props) => {
  const {dispatch, openModal, org: {id: orgId, picture}, modalUserId, modalPreferredName} = props;
  switch(openModal) {
    case TOGGLE_REMOVE_BILLING_LEADER:
      return <RemoveBillingLeaderModal
        onBackdropClick={() => {dispatch(toggleRemoveModal())}}
        orgId={orgId}
        preferredName={modalPreferredName}
        userId={modalUserId}
      />;
    case TOGGLE_LEAVE_ORG:
      return <LeaveOrgModal
        onBackdropClick={() => {dispatch(toggleLeaveModal())}}
        orgId={orgId}
        userId={modalUserId}
      />;
    default:
      return null;
  }
};

export default SettingsModal;
