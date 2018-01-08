import {commitMutation} from 'react-relay';
import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import {BILLING_LEADER} from 'universal/utils/constants';
import getInProxy from 'universal/utils/relay/getInProxy';
import toOrgMemberId from 'universal/utils/relay/toOrgMemberId';
import handleRemoveOrganization from 'universal/mutations/handlers/handleRemoveOrganization';
import handleAddOrganization from 'universal/mutations/handlers/handleAddOrganization';

graphql`
  fragment SetOrgUserRoleMutationAdded_organization on SetOrgUserRoleAddedPayload {
    organization {
      ...CompleteOrganizationFrag @relay(mask: false)
    }
    notificationsAdded {
      type
      ...PromoteToBillingLeader_notification @relay(mask: false)
      ...PaymentRejected_notification @relay(mask: false)
      ...RequestNewUser_notification @relay(mask: false)
    }
    updatedOrgMember {
      user {
        id
      }
      isBillingLeader
    }
  }
`;

graphql`
  fragment SetOrgUserRoleMutationRemoved_organization on SetOrgUserRoleRemovedPayload {
    organization {
      id
      isBillingLeader
    }
    notificationsRemoved {
      id
    }
    updatedOrgMember {
      user {
        id
      }
      isBillingLeader
    }
  }
`;

const mutation = graphql`
  mutation SetOrgUserRoleMutation($orgId: ID!, $userId: ID!, $role: String) {
    setOrgUserRole(orgId: $orgId, userId: $userId, role: $role) {
      ...SetOrgUserRoleMutationAdded_organization @relay(mask: false)
      ...SetOrgUserRoleMutationRemoved_organization @relay(mask: false)
    }
  }
`;

const popPromoteToBillingLeaderToast = (payload, {dispatch, history}) => {
  const orgId = getInProxy(payload, 'organization', 'id');
  if (!orgId) return;
  const orgName = getInProxy(payload, 'organization', 'name');
  dispatch(showInfo({
    autoDismiss: 10,
    title: 'Congratulations!',
    message: `You’ve been promoted to billing leader for ${orgName}`,
    action: {
      label: 'Check it out!',
      callback: () => {
        history.push(`/me/organizations/${orgId}/members`);
      }
    }
  }));
};

export const setOrgUserRoleAddedOrganizationUpdater = (payload, store, viewerId, options) => {
  const promotedUserId = getInProxy(payload, 'updatedOrgMember', 'user', 'id');
  if (promotedUserId === viewerId) {
    const notificationsAdded = payload.getLinkedRecords('notificationsAdded');
    handleAddNotifications(notificationsAdded, store, viewerId);
    popPromoteToBillingLeaderToast(payload, options);
    const org = payload.getLinkedRecord('organization');
    handleAddOrganization(org, store, viewerId);
  }
};

export const setOrgUserRoleRemovedOrganizationUpdater = (payload, store, viewerId) => {
  const removedUserId = getInProxy(payload, 'updatedOrgMember', 'user', 'id');
  if (removedUserId === viewerId) {
    const notificationsRemoved = payload.getLinkedRecords('notificationsRemoved');
    const notificationIdsRemoved = getInProxy(notificationsRemoved, 'id');
    handleRemoveNotifications(notificationIdsRemoved, store, viewerId);
    //const orgId = getInProxy(payload, 'organization', 'id');
    //handleRemoveOrganization(orgId, store, viewerId);
  }
};

const SetOrgUserRoleMutation = (environment, variables, options, onError, onCompleted) => {
  const {orgId, role, userId} = variables;
  return commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const isBillingLeader = role === BILLING_LEADER;
      const orgMemberId = toOrgMemberId(orgId, userId);
      const orgMember = store.get(orgMemberId);
      if (!orgMember) return;
      orgMember.setValue(isBillingLeader, 'isBillingLeader');
    },
    onCompleted,
    onError
  });
};

export default SetOrgUserRoleMutation;
