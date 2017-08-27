import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UserMemoPayload from 'server/graphql/types/UserMemoPayload';
import {getUserId} from 'server/utils/authorization';
import {USER_MEMO} from 'universal/subscriptions/constants';

export default {
  type: new GraphQLNonNull(UserMemoPayload),
  subscribe: (source, args, {authToken}) => {
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${USER_MEMO}.${userId}`;
    return makeSubscribeIter(channelName);
  }
};
