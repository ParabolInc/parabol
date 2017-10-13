import {GraphQLString} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {getUserId} from 'server/utils/authorization';
import {NEW_AUTH_TOKEN} from 'universal/utils/constants';

export default {
  type: GraphQLString,
  subscribe: (source, args, {authToken}) => {
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${NEW_AUTH_TOKEN}.${userId}`;
    return makeSubscribeIter(channelName);
  }
};
