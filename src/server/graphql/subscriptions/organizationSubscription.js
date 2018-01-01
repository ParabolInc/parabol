import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import OrganizationSubscriptionPayload from 'server/graphql/types/OrganizationSubscriptionPayload';
import {getUserId} from 'server/utils/authorization';
import {ORGANIZATION} from 'universal/utils/constants';


export default {
  type: new GraphQLNonNull(OrganizationSubscriptionPayload),
  subscribe: (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${ORGANIZATION}.${userId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    const resolve = ({data}) => ({organizationSubscription: data});
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve});
  }
};
