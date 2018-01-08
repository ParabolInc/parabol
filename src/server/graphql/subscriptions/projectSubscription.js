import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import ProjectSubscriptionPayload from 'server/graphql/types/ProjectSubscriptionPayload';
import {getUserId} from 'server/utils/authorization';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {PROJECT} from 'universal/utils/constants';

const projectSubscription = {
  type: new GraphQLNonNull(ProjectSubscriptionPayload),
  subscribe: async (source, args, {authToken, socketId, dataLoader}) => {
    // AUTH
    requireAuth(authToken);

    // RESOLUTION
    const viewerId = getUserId(authToken);
    const channelName = `${PROJECT}.${viewerId}`;
    const filterFn = ({mutatorId}) => mutatorId !== socketId;
    const resolve = ({data}) => ({projectSubscription: data});
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve});
  }
};

export default projectSubscription;
