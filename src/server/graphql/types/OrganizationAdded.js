import {GraphQLList, GraphQLObjectType} from 'graphql';
import {resolveOrganization} from 'server/graphql/resolvers';
import Organization from 'server/graphql/types/Organization';
import OrganizationAddedNotification from 'server/graphql/types/OrganizationNotification';

const OrganizationAdded = new GraphQLObjectType({
  name: 'OrganizationAdded',
  fields: () => ({
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    notificationsAdded: {
      type: new GraphQLList(OrganizationAddedNotification),
      description: 'If the org is added because the viewer was promoted, notify them and give them all other admin notifications',
      resolve: ({notificationIds}, args, {dataLoader}) => {
        if (!notificationIds || notificationIds.length === 0) return null;
        return dataLoader.get('notifications').loadMany(notificationIds);
      }
    }
  })
});

export default OrganizationAdded;
