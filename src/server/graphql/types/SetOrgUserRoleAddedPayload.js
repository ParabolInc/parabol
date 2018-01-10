import {GraphQLList, GraphQLObjectType} from 'graphql';
import OrganizationNotification from 'server/graphql/types/OrganizationNotification';
import SetOrgUserRolePayload, {setOrgUserRoleFields} from 'server/graphql/types/SetOrgUserRolePayload';
import {makeResolveNotificationsForViewer} from 'server/graphql/resolvers';

const SetOrgUserRoleAddedPayload = new GraphQLObjectType({
  name: 'SetOrgUserRoleAddedPayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields,
    notificationsAdded: {
      type: new GraphQLList(OrganizationNotification),
      description: 'If promoted, notify them and give them all other admin notifications',
      resolve: makeResolveNotificationsForViewer('notificationIdsAdded')
    }
  })
});

export default SetOrgUserRoleAddedPayload;
