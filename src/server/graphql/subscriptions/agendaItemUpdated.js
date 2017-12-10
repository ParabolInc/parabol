import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateAgendaItemPayload from 'server/graphql/types/UpdateAgendaItemPayload';
import {requireTeamMember} from 'server/utils/authorization';
import {AGENDA_ITEM_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateAgendaItemPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${AGENDA_ITEM_UPDATED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
