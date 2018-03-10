import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import TeamSubscriptionPayload from 'server/graphql/types/TeamSubscriptionPayload';
import {getUserId, isAuthenticated, sendNotAuthenticatedAccessError} from 'server/utils/authorization';
import {TEAM} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(TeamSubscriptionPayload),
  subscribe: (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isAuthenticated(authToken)) return sendNotAuthenticatedAccessError(authToken);

    // RESOLUTION
    const userId = getUserId(authToken);
    const {tms: teamIds} = authToken;
    const channelNames = teamIds.concat(userId).map((id) => `${TEAM}.${id}`);
    const filterFn = (value) => value.mutatorId !== socketId;
    const resolve = ({data}) => ({teamSubscription: data});
    return makeSubscribeIter(channelNames, {filterFn, dataLoader, resolve});
  }
};
