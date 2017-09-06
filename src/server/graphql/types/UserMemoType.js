import {GraphQLEnumType} from 'graphql';
import {FACILITATOR_REQUEST} from 'universal/subscriptions/constants';

const UserMemoType = new GraphQLEnumType({
  name: 'UserMemoType',
  description: 'A list of all the memos a user might receive',
  values: {
    [FACILITATOR_REQUEST]: {}
  }
});

export default UserMemoType;
