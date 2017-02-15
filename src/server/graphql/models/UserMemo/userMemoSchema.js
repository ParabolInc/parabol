import {
  GraphQLObjectType,
  GraphQLID
} from 'graphql';

export const UserMemo = new GraphQLObjectType({
  name: 'UserMemo',
  description: 'A temporary message for a single user',
  fields: () => ({
    teamId: {type: GraphQLID, description: 'The teamId affected by this message'},
  })
});
