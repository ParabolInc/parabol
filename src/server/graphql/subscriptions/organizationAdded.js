import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AddOrgPayload from 'server/graphql/types/AddOrgPayload';
import {getUserId} from 'server/utils/authorization';
import {ORGANIZATION_ADDED} from 'universal/utils/constants';


export default {
  type: new GraphQLNonNull(AddOrgPayload),
  subscribe: (source, args, {authToken, socketId}) => {
    // AUTH
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${ORGANIZATION_ADDED}.${userId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn});
  }
};
