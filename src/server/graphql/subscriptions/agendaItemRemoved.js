import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import RemoveAgendaItemPayload from 'server/graphql/types/RemoveAgendaItemPayload';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {AGENDA_ITEM_REMOVED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(RemoveAgendaItemPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, getDataLoader, socketId}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${AGENDA_ITEM_REMOVED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, getDataLoader});
  }
};
