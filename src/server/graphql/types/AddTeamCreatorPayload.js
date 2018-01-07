import {GraphQLObjectType} from 'graphql';
import {addTeamFields} from 'server/graphql/types/AddTeamPayload';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';

const AddTeamCreatorPayload = new GraphQLObjectType({
  name: 'AddTeamCreatorPayload',
  interfaces: () => [AddTeamPayload],
  fields: () => ({
    ...addTeamFields
  })
});

export default AddTeamCreatorPayload;
