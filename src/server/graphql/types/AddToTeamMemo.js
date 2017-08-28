import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import UserMemoPayload from 'server/graphql/types/UserMemoPayload';
import UserMemoType from 'server/graphql/types/UserMemoType';
import AuthToken from 'server/graphql/types/AuthToken';

const AddToTeamMemo = new GraphQLObjectType({
  name: 'AddToTeamMemo',
  description: 'A user memo sent by a team member to request to become the facilitator',
  interfaces: () => [UserMemoPayload],
  fields: () => ({
    _authToken: {
      type: AuthToken,
      description: 'The new auth token for the user. Requested by, but not sent to the client'
    },
    teamName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the team the user is joining'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId the user is joining'
    },
    type: {
      type: new GraphQLNonNull(UserMemoType)
    }
  })
});

export default AddToTeamMemo;
