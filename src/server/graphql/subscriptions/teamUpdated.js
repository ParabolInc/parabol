import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateTeamPayload from 'server/graphql/types/UpdateTeamPayload';
import {getUserId} from 'server/utils/authorization';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import {TEAM_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateTeamPayload),
  subscribe: (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireAuth(authToken);
    const userId = getUserId(authToken);
    const {tms: teamIds} = authToken;

    // RESOLUTION
    const channelNames = teamIds.concat(userId).map((id) => `${TEAM_UPDATED}.${id}`);
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelNames, {filterFn, dataLoader});
  }
};
