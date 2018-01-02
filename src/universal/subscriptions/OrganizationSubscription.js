import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleAddOrganization from 'universal/mutations/handlers/handleAddOrganization';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveOrganization from 'universal/mutations/handlers/handleRemoveOrganization';
import getInProxy from 'universal/utils/relay/getInProxy';

const subscription = graphql`
  subscription OrganizationSubscription {
    organizationSubscription {
      __typename
      ...on OrganizationAdded {
        organization {
          ...CompleteOrganizationFrag @relay(mask: false)
        }
        notificationsAdded {
          ...PromoteToBillingLeader_notification @relay(mask: false)
          ...PaymentRejected_notification @relay(mask: false)
          ...RequestNewUser_notification @relay(mask: false)
        }
      }
      ... on OrganizationUpdated {
        organization {
          ...CompleteOrganizationFrag @relay(mask: false)
        }
        updatedOrgMember {
          isBillingLeader
        }
      }
      ... on OrganizationRemoved {
        organization {
          id
        }
        notificationsRemoved {
          id
        }
      }
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
      const organization = payload.getLinkedRecord('organization');
      const type = payload.getLinkedRecord('__typename');
      const options = {dispatch, environment, history, store};
      if (type === 'OrganizationAdded') {
        const notifications = payload.getLinkedRecords('notificationsAdded');
        handleAddOrganization(organization, store, viewerId);
        handleAddNotifications(notifications, options);
      } else if (type === 'OrganizationRemoved') {
        const organizationId = getInProxy(organization, 'id');
        const notificationsRemoved = payload.getLinkedRecords('notificationsRemoved');
        const notificationIds = getInProxy(notificationsRemoved, 'id');
        handleRemoveOrganization(organizationId, store, viewerId);
        handleRemoveNotifications(notificationIds, store, viewerId);
      }
    }
  };
};

export default OrganizationSubscription;
