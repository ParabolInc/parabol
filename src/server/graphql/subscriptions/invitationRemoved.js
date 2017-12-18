import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import RemoveInvitationPayload from 'server/graphql/types/RemoveInvitationPayload';
import {requireTeamMember} from 'server/utils/authorization';
import {INVITATION_REMOVED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(RemoveInvitationPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${INVITATION_REMOVED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
