import {GraphQLObjectType} from 'graphql';
import AddOrgPayload, {addOrgFields} from 'server/graphql/types/AddOrgPayload';

const AddOrgCreatorPayload = new GraphQLObjectType({
  name: 'AddOrgCreatorPayload',
  interfaces: () => [AddOrgPayload],
  fields: () => ({
    ...addOrgFields
  })
});

export default AddOrgCreatorPayload;
