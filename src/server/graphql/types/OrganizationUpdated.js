import {GraphQLObjectType} from 'graphql';
import {resolveOrganization} from 'server/graphql/resolvers';
import Notification from 'server/graphql/types/Notification';
import Organization from 'server/graphql/types/Organization';
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
      // TODO fix
      type: Notification
    }
  })
});

export default OrganizationUpdated;
