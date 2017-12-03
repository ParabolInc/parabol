import {GraphQLBoolean, GraphQLID, GraphQLString, GraphQLInputObjectType} from 'graphql';

const TeamInput = new GraphQLInputObjectType({
  name: 'TeamInput',
  fields: () => ({
    id: {type: GraphQLID, description: 'The unique team ID'},
    name: {type: GraphQLString, description: 'The name of the team'},
    orgId: {type: GraphQLID, description: 'The unique orginization ID that pays for the team'},
    isArchived: {type: GraphQLBoolean}
  })
});

export default TeamInput;