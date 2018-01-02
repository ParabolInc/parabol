import {commitMutation} from 'react-relay';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import {BILLING_LEADER} from 'universal/utils/constants';
import getInProxy from 'universal/utils/relay/getInProxy';
import toOrgMemberId from 'universal/utils/relay/toOrgMemberId';

const mutation = graphql`
  mutation SetOrgUserRoleMutation($orgId: ID!, $userId: ID!, $role: String) {
    setOrgUserRole(orgId: $orgId, userId: $userId, role: $role) {
      organization {
        ...CompleteOrganizationFrag @relay(mask: false)
      }
      updatedOrgMember {
        isBillingLeader
      }
      notificationsAdded {
        ...PromoteToBillingLeader_notification @relay(mask: false)
        ...PaymentRejected_notification @relay(mask: false)
        ...RequestNewUser_notification @relay(mask: false)
      }
      notificationsRemoved {
        id
      }
    }
  }
`;

const SetOrgUserRoleMutation = (environment, variables, options, onError, onCompleted) => {
  const {orgId, role, userId} = variables;
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('setOrgUserRole');
      const notificationsAdded = payload.getLinkedRecords('notificationsAdded');
      const notificationsRemoved = payload.getLinkedRecords('notificationsRemoved');
      const notificationIdsRemoved = getInProxy(notificationsRemoved, 'id');
      handleAddNotifications(notificationsAdded, {environment, store, ...options});
      handleRemoveNotifications(notificationIdsRemoved, store, viewerId);
    },
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
