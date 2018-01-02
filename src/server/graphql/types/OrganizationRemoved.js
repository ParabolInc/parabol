import {GraphQLList, GraphQLObjectType} from 'graphql';
import Organization from 'server/graphql/types/Organization';
import OrganizationAddedNotification from 'server/graphql/types/OrganizationAddedNotification';

const OrganizationRemoved = new GraphQLObjectType({
  name: 'OrganizationRemoved',
  fields: () => ({
    organization: {
      type: Organization
    },
    notificationsRemoved: {
      type: new GraphQLList(OrganizationAddedNotification),
      description: 'If demoted, notify them and remove all other admin notifications',
      resolve: ({notificationIdsRemoved}, args, {dataLoader}) => {
        if (!notificationIdsRemoved || notificationIdsRemoved.length === 0) return null;
        return dataLoader.get('notifications').loadMany(notificationIdsRemoved);
      }
    }
  })
});

export default OrganizationRemoved;
