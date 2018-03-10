import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AgendaItemSubscriptionPayload from 'server/graphql/types/AgendaItemSubscriptionPayload';
import {isTeamMember, sendTeamAccessError} from 'server/utils/authorization';
import {AGENDA_ITEM} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(AgendaItemSubscriptionPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId);

    // RESOLUTION
    const channelName = `${AGENDA_ITEM}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    const resolve = ({data}) => ({agendaItemSubscription: data});
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve});
  }
};
