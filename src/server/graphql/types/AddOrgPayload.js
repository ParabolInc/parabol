import {GraphQLObjectType} from 'graphql';
import Organization from 'server/graphql/types/Organization';

const AddOrgPayload = new GraphQLObjectType({
  name: 'AddOrgPayload',
  fields: () => ({
    organization: {
      type: Organization
    }
  })
});

export default AddOrgPayload;
