import {GraphQLEnumType} from 'graphql';
import {ADD_TO_TEAM, FACILITATOR_REQUEST, JOIN_TEAM, REJOIN_TEAM} from 'universal/subscriptions/constants';

const UserMemoType = new GraphQLEnumType({
  name: 'UserMemoType',
  description: 'A list of all the memos a user might receive',
  values: {
    [ADD_TO_TEAM]: {},
    [FACILITATOR_REQUEST]: {},
    [JOIN_TEAM]: {},
    [REJOIN_TEAM]: {}
  }
});

export default UserMemoType;
