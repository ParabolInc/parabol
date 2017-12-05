import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import AddAgendaItemPayload from 'server/graphql/types/AddAgendaItemPayload';
import {AGENDA_ITEM_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(AddAgendaItemPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, getDataLoader, socketId}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${AGENDA_ITEM_ADDED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, getDataLoader});
  }
};
