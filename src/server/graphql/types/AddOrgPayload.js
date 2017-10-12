import {GraphQLObjectType, GraphQLString} from 'graphql';
import Organization from 'server/graphql/types/Organization';

const AddOrgPayload = new GraphQLObjectType({
  name: 'AddOrgPayload',
  fields: () => ({
    authToken: {
      type: GraphQLString,
    },
    organization: {
      type: Organization
    }
  })
});

export default AddOrgPayload;
