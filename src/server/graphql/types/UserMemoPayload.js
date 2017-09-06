import {GraphQLInterfaceType} from 'graphql';
import FacilitatorRequestMemo from 'server/graphql/types/FacilitatorRequestMemo';
import UserMemoType from 'server/graphql/types/UserMemoType';
import {FACILITATOR_REQUEST} from 'universal/subscriptions/constants';

const resolveTypeLookup = {
  [FACILITATOR_REQUEST]: FacilitatorRequestMemo
};

const UserMemoPayload = new GraphQLInterfaceType({
  name: 'UserMemoPayload',
  fields: {
    type: {
      type: UserMemoType
    }
  },
  resolveType(value) {
    return resolveTypeLookup[value.type];
  }
});

export default UserMemoPayload;
