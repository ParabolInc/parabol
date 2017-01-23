import React, {PropTypes} from 'react';
import {
  TOGGLE_REMOVE_BILLING_LEADER,
  TOGGLE_LEAVE_ORG,
  TOGGLE_PAYMENT_MODAL,
  TOGGLE_AVATAR_MODAL,
} from 'universal/modules/userDashboard/ducks/orgSettingsDuck';
import RemoveBillingLeaderModal from 'universal/modules/userDashboard/components/RemoveBillingLeaderModal/RemoveBillingLeaderModal';
import LeaveOrgModal from 'universal/modules/userDashboard/components/LeaveOrgModal/LeaveOrgModal';
import CreditCardModal from 'universal/modules/userDashboard/components/CreditCardModal/CreditCardModal';
import {togglePaymentModal, toggleLeaveModal, toggleRemoveModal, toggleAvatarModal} from 'universal/modules/userDashboard/ducks/orgSettingsDuck';
import PhotoUploadModal from 'universal/components/PhotoUploadModal/PhotoUploadModal';
import OrgAvatarInput from 'universal/modules/userDashboard/components/OrgAvatarInput/OrgAvatarInput';

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
    case TOGGLE_PAYMENT_MODAL:
      return <CreditCardModal
        onBackdropClick={() => {dispatch(togglePaymentModal())}}
        orgId={orgId}
      />;
    case TOGGLE_LEAVE_ORG:
      return <LeaveOrgModal
        onBackdropClick={() => {dispatch(toggleLeaveModal())}}
        orgId={orgId}
        userId={modalUserId}
      />;
    case TOGGLE_AVATAR_MODAL:
      return (
        <PhotoUploadModal onBackdropClick={() => {dispatch(toggleAvatarModal())}} picture={picture}>
          <OrgAvatarInput orgId={orgId}/>
        </PhotoUploadModal>
      );
    default:
      return null;
  }
};

export default SettingsModal;
