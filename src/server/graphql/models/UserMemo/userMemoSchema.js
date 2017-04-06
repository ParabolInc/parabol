import {
  GraphQLObjectType,
  GraphQLID
} from 'graphql';


export const UserMemo = new GraphQLObjectType({ // eslint-disable-line import/prefer-default-export
  name: 'UserMemo',
  description: 'A temporary message for a single user',
  fields: () => ({
    teamId: {type: GraphQLID, description: 'The teamId affected by this message'},
  })
});
