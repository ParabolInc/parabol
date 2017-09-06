import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import UserMemoPayload from 'server/graphql/types/UserMemoPayload';
import UserMemoType from 'server/graphql/types/UserMemoType';

const FacilitatorRequestMemo = new GraphQLObjectType({
  name: 'FacilitatorRequestMemo',
  description: 'A user memo sent by a team member to request to become the facilitator',
  interfaces: () => [UserMemoPayload],
  fields: () => ({
    requestorName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team member requesting to become facilitator'
    },
    requestorId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamMemberId of the requestor'
    },
    type: {
      type: new GraphQLNonNull(UserMemoType)
    }
  })
});

export default FacilitatorRequestMemo;
