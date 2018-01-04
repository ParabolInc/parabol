import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import ProjectSubscriptionPayload from 'server/graphql/types/ProjectSubscriptionPayload';
import {getUserId} from 'server/utils/authorization';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {ADDED, PROJECT, REMOVED, UPDATED} from 'universal/utils/constants';

const getChannelData = (data, viewerId) => {
  const {isPrivate, wasPrivate, userId} = data;
  if (data.type === UPDATED && viewerId !== userId && isPrivate !== wasPrivate) {
    const type = isPrivate ? REMOVED : ADDED;
    return {...data, type};
  }
  return data;
};

const projectSubscription = {
  type: new GraphQLNonNull(ProjectSubscriptionPayload),
  subscribe: async (source, args, {authToken, socketId, dataLoader}) => {
    // AUTH
    requireAuth(authToken);

    // RESOLUTION
    const viewerId = getUserId(authToken);
    const {tms: teamIds} = authToken;
    const channelNames = teamIds.map((id) => `${PROJECT}.${id}`);
    const filterFn = ({mutatorId}) => mutatorId !== socketId;
    const resolve = ({data}) => ({projectSubscription: data});
    return makeSubscribeIter(channelNames, {filterFn, dataLoader, resolve});
  }
};

export default projectSubscription;
