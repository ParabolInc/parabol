import {addOrgMutationOrganizationUpdater} from 'universal/mutations/AddOrgMutation';
import {approveToOrgOrganizationUpdater} from 'universal/mutations/ApproveToOrgMutation';
import {
  setOrgUserRoleAddedOrganizationUpdater,
  setOrgUserRoleRemovedOrganizationUpdater
} from 'universal/mutations/SetOrgUserRoleMutation';

// ...on OrganizationAdded {
//  organization {
//  ...CompleteOrganizationFrag @relay(mask: false)
//  }
//  notificationsAdded {
//  ...PromoteToBillingLeader_notification @relay(mask: false)
//  ...PaymentRejected_notification @relay(mask: false)
//  ...RequestNewUser_notification @relay(mask: false)
//  }
// }
// ... on OrganizationUpdated {
//  organization {
//  ...CompleteOrganizationFrag @relay(mask: false)
//  }
//  updatedOrgMember {
//    isBillingLeader
//  }
//  notification {
//  ...PaymentRejected_notification @relay(mask: false)
//  }
// }
// ... on OrganizationRemoved {
//  organization {
//    id
//  }
//  notificationsRemoved {
//    id
//  }
// }

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      __typename
      ...AddOrgMutation_organization
      ...ApproveToOrgMutation_organization
      ...SetOrgUserRoleMutationAdded_organiation
      ...SetOrgUserRoleMutationRemoved_organization
      ...SetOrgUserRoleMutationAnnounced_organization
      ...UpdateOrgMutation_organization
      ...UpgradeToProMutation_organization
    }
  }
`;

const OrganizationSubscription = (environment, queryVariables, subParams) => {
  const {dispatch, history} = subParams;
  const {viewerId} = environment;
  return {
    subscription,
    variables: {},
    updater: (store) => {
      const payload = store.getRootField('organizationSubscription');
      const type = payload.getLinkedRecord('__typename');
      const options = {dispatch, history};
      switch (type) {
        case 'AddOrgPayload':
          addOrgMutationOrganizationUpdater(payload, store, viewerId);
          break;
        case 'ApproveToOrgPayload':
          approveToOrgOrganizationUpdater(payload, store, viewerId);
          break;
        case 'SetOrgUserRoleAddedPayload':
          setOrgUserRoleAddedOrganizationUpdater(payload, store, viewerId, options);
          break;
        case 'SetOrgUserRoleRemovedPayload':
          setOrgUserRoleRemovedOrganizationUpdater(payload, store, viewerId);
          break;
        default:
          console.error('OrganizationSubscription case fail', type);
      }
      // const organization = payload.getLinkedRecord('organization');
      // const options = {dispatch, environment, history, store};
      // if (type === 'OrganizationAdded') {
      //  const notifications = payload.getLinkedRecords('notificationsAdded');
      //  handleAddOrganization(organization, store, viewerId);
      //  handleAddNotifications(notifications, options);
      // } else if (type === 'OrganizationUpdated') {
      //  const notification = payload.getLinkedRecord('notification');
      //  handleAddNotifications(notification, options);
      // } else if (type === 'OrganizationRemoved') {
      //  const organizationId = getInProxy(organization, 'id');
      //  const notificationsRemoved = payload.getLinkedRecords('notificationsRemoved');
      //  const notificationIds = getInProxy(notificationsRemoved, 'id');
      //  handleRemoveOrganization(organizationId, store, viewerId);
      //  handleRemoveNotifications(notificationIds, store, viewerId);
      // }
    }
  };
};

export default OrganizationSubscription;
