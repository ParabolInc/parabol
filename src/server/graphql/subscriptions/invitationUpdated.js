import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateInvitationPayload from 'server/graphql/types/UpdateInvitationPayload';
import {requireTeamMember} from 'server/utils/authorization';
import {INVITATION_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateInvitationPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${INVITATION_UPDATED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
