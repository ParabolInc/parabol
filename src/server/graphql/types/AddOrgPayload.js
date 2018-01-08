import {GraphQLObjectType} from 'graphql';
import {resolveOrganization} from 'server/graphql/resolvers';
import {addTeamFields} from 'server/graphql/types/AddTeamPayload';
import Organization from 'server/graphql/types/Organization';

const AddOrgPayload = new GraphQLObjectType({
  name: 'AddOrgPayload',
  fields: () => ({
    organization: {
      type: Organization,
      resolve: resolveOrganization
    },
    ...addTeamFields
  })
});

export default AddOrgPayload;
