import {GraphQLObjectType} from 'graphql';
import Organization from 'server/graphql/types/Organization';

const UpdateOrgPayload = new GraphQLObjectType({
  name: 'UpdateOrgPayload',
  fields: () => ({
    organization: {
      type: Organization,
      description: 'The updated org'
    }
  })
});

export default UpdateOrgPayload;
