import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AddAgendaItemPayload from 'server/graphql/types/AddAgendaItemPayload';
import {getUserId, requireAuth} from 'server/utils/authorization';
import {TEAM_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(AddAgendaItemPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireAuth(authToken);
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${TEAM_ADDED}.${userId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
