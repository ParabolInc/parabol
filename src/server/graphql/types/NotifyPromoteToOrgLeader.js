import {GraphQLObjectType} from 'graphql';
import {resolveOrganization} from 'server/graphql/resolvers';
import Notification, {notificationInterfaceFields} from 'server/graphql/types/Notification';
import Organization from 'server/graphql/types/Organization';
import OrganizationAddedNotification from 'server/graphql/types/OrganizationNotification';

const NotifyPromoteToOrgLeader = new GraphQLObjectType({
  name: 'NotifyPromoteToOrgLeader',
  description: 'A notification alerting the user that they have been promoted (to team or org leader)',
  interfaces: () => [Notification, OrganizationAddedNotification],
  fields: () => ({
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    ...notificationInterfaceFields
  })
});

export default NotifyPromoteToOrgLeader;
