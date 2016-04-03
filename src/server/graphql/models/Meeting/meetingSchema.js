import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';

export const Meeting = new GraphQLObjectType({
  name: 'Meeting',
  description: 'A meeting',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The userId'},
    createdAt: {type: GraphQLString, description: 'The datetime the user was created'},
    updatedAt: {type: GraphQLString, description: 'The datetime the user was last updated'},
    updatedBy: {type: GraphQLString, description: 'The last user to update the content'},
    content: {type: GraphQLString, description: 'The content of the meeting'},
    editing: {type: GraphQLBoolean, description: 'true if a user is editing, otherwise false'}
  })
});
