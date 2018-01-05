import {GraphQLObjectType} from 'graphql';
import {resolveOrganization} from 'server/graphql/resolvers';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Organization from 'server/graphql/types/Organization';
import OrganizationAddedNotification from 'server/graphql/types/OrganizationNotification';

const NotifyPaymentRejected = new GraphQLObjectType({
  name: 'NotifyPaymentRejected',
  description: 'A notification sent to a user when their payment has been rejected',
  interfaces: () => [Notification, OrganizationAddedNotification],
  fields: () => ({
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    ...notificationInterfaceFields
  })
});

export default NotifyPaymentRejected;
