import {GraphQLList, GraphQLObjectType} from 'graphql';
import OrganizationNotification from 'server/graphql/types/OrganizationNotification';
import SetOrgUserRolePayload, {setOrgUserRoleFields} from 'server/graphql/types/SetOrgUserRolePayload';

const SetOrgUserRoleRemovedPayload = new GraphQLObjectType({
  name: 'SetOrgUserRoleRemovedPayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields,
    notificationsRemoved: {
      type: new GraphQLList(OrganizationNotification),
      description: 'If demoted, notify them and remove all other admin notifications',
      resolve: ({notificationIdsRemoved}, args, {dataLoader}) => {
        if (!notificationIdsRemoved || notificationIdsRemoved.length === 0) return null;
        return dataLoader.get('notifications').loadMany(notificationIdsRemoved);
      }
    }
  })
});

export default SetOrgUserRoleRemovedPayload;
