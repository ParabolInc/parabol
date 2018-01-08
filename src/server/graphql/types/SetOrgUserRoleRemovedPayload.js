import {GraphQLList, GraphQLObjectType} from 'graphql';
import OrganizationNotification from 'server/graphql/types/OrganizationNotification';
import SetOrgUserRolePayload, {setOrgUserRoleFields} from 'server/graphql/types/SetOrgUserRolePayload';
import {makeResolveNotificationsForViewer} from 'server/graphql/resolvers';

const SetOrgUserRoleRemovedPayload = new GraphQLObjectType({
  name: 'SetOrgUserRoleRemovedPayload',
  interfaces: () => [SetOrgUserRolePayload],
  fields: () => ({
    ...setOrgUserRoleFields,
    notificationsRemoved: {
      type: new GraphQLList(OrganizationNotification),
      description: 'If demoted, notify them and remove all other admin notifications',
      resolve: makeResolveNotificationsForViewer('', 'notificationsRemoved')
    }
  })
});

export default SetOrgUserRoleRemovedPayload;
