import {GraphQLList, GraphQLObjectType} from 'graphql';
import OrganizationNotification from 'server/graphql/types/OrganizationNotification';
import SetOrgUserRolePayload, {setOrgUserRoleFields} from 'server/graphql/types/SetOrgUserRolePayload';

const SetOrgUserRoleAddedPayload = new GraphQLObjectType({
  name: 'SetOrgUserRoleAddedPayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields,
    notificationsAdded: {
      type: new GraphQLList(OrganizationNotification),
      description: 'If promoted, notify them and give them all other admin notifications',
      resolve: ({notificationIdsAdded}, args, {dataLoader}) => {
        if (!notificationIdsAdded || notificationIdsAdded.length === 0) return null;
        return dataLoader.get('notifications').loadMany(notificationIdsAdded);
      }
    }
  })
});

export default SetOrgUserRoleAddedPayload;
