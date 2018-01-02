import {GraphQLObjectType} from 'graphql';
import {resolveNotification, resolveOrganization} from 'server/graphql/resolvers';
import Organization from 'server/graphql/types/Organization';
import OrganizationAddedNotification from 'server/graphql/types/OrganizationAddedNotification';
import OrganizationMember from 'server/graphql/types/OrganizationMember';

const OrganizationUpdated = new GraphQLObjectType({
  name: 'OrganizationUpdated',
  fields: () => ({
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    updatedOrgMember: {
      type: OrganizationMember,
      resolve: (source) => source
    },
    notification: {
      type: OrganizationAddedNotification,
      description: 'A notification that accompanies an org update, like a failed payment',
      resolve: resolveNotification
    }
  })
});

export default OrganizationUpdated;
