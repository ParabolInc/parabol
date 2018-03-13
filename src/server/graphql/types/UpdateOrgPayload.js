import {GraphQLObjectType} from 'graphql';
import {resolveOrganization} from 'server/graphql/resolvers';
import Organization from 'server/graphql/types/Organization';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const UpdateOrgPayload = new GraphQLObjectType({
  name: 'UpdateOrgPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    organization: {
      type: Organization,
      description: 'The updated org',
      resolve: resolveOrganization
    }
  })
});

export default UpdateOrgPayload;
