import {GraphQLInterfaceType} from 'graphql';
import FacilitatorRequestMemo from 'server/graphql/types/FacilitatorRequestMemo';
import UserMemoType from 'server/graphql/types/UserMemoType';
import {ADD_TO_TEAM, FACILITATOR_REQUEST} from 'universal/subscriptions/constants';
import AddToTeamMemo from 'server/graphql/types/AddToTeamMemo';

const resolveTypeLookup = {
  [FACILITATOR_REQUEST]: FacilitatorRequestMemo,
  [ADD_TO_TEAM]: AddToTeamMemo
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
