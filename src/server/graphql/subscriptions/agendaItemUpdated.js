import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateAgendaItemPayload from 'server/graphql/types/UpdateAgendaItemPayload';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {AGENDA_ITEM_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateAgendaItemPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, getDataLoader, socketId}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${AGENDA_ITEM_UPDATED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, getDataLoader});
  }
};
