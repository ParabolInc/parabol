import {GraphQLObjectType} from 'graphql';
import Organization from 'server/graphql/types/Organization';
import User from 'server/graphql/types/User';

const UpdateOrgPayload = new GraphQLObjectType({
  name: 'UpdateOrgPayload',
  fields: () => ({
    organization: {
      type: Organization,
      description: 'The updated org'
    },
    updatedOrgUser: {
      type: User
    }
  })
});

export default UpdateOrgPayload;
