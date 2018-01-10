import {GraphQLString} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {getUserId} from 'server/utils/authorization';
import tmsSignToken from 'server/utils/tmsSignToken';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {NEW_AUTH_TOKEN} from 'universal/utils/constants';

export default {
  type: GraphQLString,
  subscribe: (source, args, {authToken, dataLoader}) => {
    // AUTH
    requireAuth(authToken);

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
