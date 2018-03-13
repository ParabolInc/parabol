import {GraphQLString} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {getUserId, isAuthenticated} from 'server/utils/authorization';
import tmsSignToken from 'server/utils/tmsSignToken';
import {NEW_AUTH_TOKEN} from 'universal/utils/constants';
import {sendNotAuthenticatedAccessError} from 'server/utils/authorizationErrors';

export default {
  type: GraphQLString,
  subscribe: (source, args, {authToken, dataLoader}) => {
    // AUTH
    if (!isAuthenticated(authToken)) return sendNotAuthenticatedAccessError(authToken, null);

    // RESOLUTION
    const viewerId = getUserId(authToken);
    const channelName = `${NEW_AUTH_TOKEN}.${viewerId}`;
    const resolve = ({data}) => {
      const {tms} = data;
      const newAuthToken = tmsSignToken({sub: viewerId}, tms);
      return {newAuthToken};
    };
    return makeSubscribeIter(channelName, {dataLoader, resolve});
  }
};
