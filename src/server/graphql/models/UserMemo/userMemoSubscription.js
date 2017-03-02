import {UserMemo} from './userMemoSchema';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';

export default {
  userMemo: {
    description: 'messages for a single user triggered by another user',
    type: new GraphQLList(UserMemo),
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The userId for this specific user'
      }
    }
  }
};
