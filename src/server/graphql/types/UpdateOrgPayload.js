import {GraphQLObjectType} from 'graphql';
import {resolveOrganization} from 'server/graphql/resolvers';
import Organization from 'server/graphql/types/Organization';

const UpdateOrgPayload = new GraphQLObjectType({
  name: 'UpdateOrgPayload',
  fields: () => ({
    organization: {
      type: Organization,
      description: 'The updated org',
      resolve: resolveOrganization
    }
  })
});

export default UpdateOrgPayload;
