import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AddInvitationPayload from 'server/graphql/types/AddInvitationPayload';
import {requireTeamMember} from 'server/utils/authorization';
import {INVITATION_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(AddInvitationPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${INVITATION_ADDED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
