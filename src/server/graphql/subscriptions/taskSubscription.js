import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import TaskSubscriptionPayload from 'server/graphql/types/TaskSubscriptionPayload';
import {getUserId} from 'server/utils/authorization';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {TASK} from 'universal/utils/constants';

const taskSubscription = {
  type: new GraphQLNonNull(TaskSubscriptionPayload),
  subscribe: async (source, args, {authToken, socketId, dataLoader}) => {
    // AUTH
    requireAuth(authToken);

    // RESOLUTION
    const viewerId = getUserId(authToken);
    const channelName = `${TASK}.${viewerId}`;
    const filterFn = ({mutatorId}) => mutatorId !== socketId;
    const resolve = ({data}) => ({taskSubscription: data});
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve});
  }
};

export default taskSubscription;
