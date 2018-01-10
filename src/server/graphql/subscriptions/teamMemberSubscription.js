import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import TeamMemberSubscriptionPayload from 'server/graphql/types/TeamMemberSubscriptionPayload';
import {getUserId} from 'server/utils/authorization';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {TEAM_MEMBER} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(TeamMemberSubscriptionPayload),
  subscribe: async (source, args, {authToken, socketId, dataLoader}) => {
    // AUTH
    requireAuth(authToken);

    // RESOLUTION
    const userId = getUserId(authToken);
    const {tms: teamIds} = authToken;
    const channelNames = teamIds.concat(userId).map((id) => `${TEAM_MEMBER}.${id}`);
    const filterFn = (value) => value.mutatorId !== socketId;
    const resolve = ({data}) => ({teamMemberSubscription: data});
    return makeSubscribeIter(channelNames, {filterFn, dataLoader, resolve});
  }
};
