import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import RemoveAgendaItemPayload from 'server/graphql/types/RemoveAgendaItemPayload';
import {requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {AGENDA_ITEM_REMOVED} from 'universal/utils/constants';

export default {
  type: RemoveAgendaItemPayload,
  description: 'Remove an agenda item',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The agenda item unique id'
    }
  },
  async resolve(source, {id}, {authToken, dataLoader, socketId}) {
    const r = getRethink();
    const operationId = dataLoader.share();

    // AUTH
    // id is of format 'teamId::shortid'
    const [teamId] = id.split('::');
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const agendaItem = await r.table('AgendaItem').get(id)
      .delete({returnChanges: true})('changes')(0)('old_val')
      .default(null);
    if (!agendaItem) {
      throw new Error('Agenda item does not exist');
    }
    const agendaItemRemoved = {agendaItem};
    getPubSub().publish(`${AGENDA_ITEM_REMOVED}.${teamId}`, {agendaItemRemoved, operationId, mutatorId: socketId});
    return agendaItemRemoved;
  }
};
