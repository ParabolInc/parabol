import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import getRequestedFields from 'server/graphql/getRequestedFields';
import {AgendaItem} from './agendaItemSchema';
import {requireSUOrTeamMember, requireTeamIsPaid} from 'server/utils/authorization';
import makeChangefeedHandler from 'server/utils/makeChangefeedHandler';

export default {
  agenda: {
    type: new GraphQLList(AgendaItem),
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team ID, where each team has a bunch of agenda items'
      }
    },
    async resolve(source, {teamId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();

      // AUTH
      requireSUOrTeamMember(authToken, teamId);
      await requireTeamIsPaid(teamId);

      // RESOLUTION
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('AgendaItem')
        .getAll(teamId, {index: 'teamId'})
        .filter({isActive: true})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
