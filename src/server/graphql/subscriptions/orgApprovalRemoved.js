import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import {requireTeamMember} from 'server/utils/authorization';
import {ORG_APPROVAL_REMOVED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(CancelApprovalPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${ORG_APPROVAL_REMOVED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
