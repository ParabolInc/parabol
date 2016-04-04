import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList
} from 'graphql';

export const Meeting = new GraphQLObjectType({
  name: 'Meeting',
  description: 'A meeting',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique meeting ID'},
    createdAt: {type: GraphQLString, description: 'The datetime the meeting was created'},
    updatedAt: {type: GraphQLString, description: 'The datetime the meeting was last updated'},
    lastUpdatedBy: {type: GraphQLString, description: 'The last user to update the content'},
    content: {type: GraphQLString, description: 'The content of the meeting'},
    currentEditors: {
      type: new GraphQLList(GraphQLString),
      description: 'a list of socketIds currently editing the content'
    }
  })
});
