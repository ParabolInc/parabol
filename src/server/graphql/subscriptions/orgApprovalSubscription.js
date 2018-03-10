import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import OrgApprovalSubscriptionPayload from 'server/graphql/types/OrgApprovalSubscriptionPayload';
import {isTeamMember, sendTeamAccessError} from 'server/utils/authorization';
import {ORG_APPROVAL} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(OrgApprovalSubscriptionPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);

    // RESOLUTION
    const channelName = `${ORG_APPROVAL}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    const resolve = ({data}) => ({orgApprovalSubscription: data});
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve});
  }
};
