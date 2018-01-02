import {GraphQLList, GraphQLObjectType} from 'graphql';
import {resolveOrganization} from 'server/graphql/resolvers';
import Organization from 'server/graphql/types/Organization';
import OrganizationAddedNotification from 'server/graphql/types/OrganizationAddedNotification';
import OrganizationMember from 'server/graphql/types/OrganizationMember';

const SetOrgUserRolePayload = new GraphQLObjectType({
  name: 'SetOrgUserRolePayload',
  fields: () => ({
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    updatedOrgMember: {
      type: OrganizationMember,
      // This feels weird, but it's the DRYest way
      resolve: (source) => source
    },
    notificationsAdded: {
      type: new GraphQLList(OrganizationAddedNotification),
      description: 'If promoted, notify them and give them all other admin notifications',
      resolve: ({notificationIdsAdded}, args, {dataLoader}) => {
        if (!notificationIdsAdded || notificationIdsAdded.length === 0) return null;
        return dataLoader.get('notifications').loadMany(notificationIdsAdded);
      }
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

export default SetOrgUserRolePayload;
