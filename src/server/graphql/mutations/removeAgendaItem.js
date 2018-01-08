import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import RemoveAgendaItemPayload from 'server/graphql/types/RemoveAgendaItemPayload';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {AGENDA_ITEM} from 'universal/utils/constants';

export default {
  type: RemoveAgendaItemPayload,
  description: 'Remove an agenda item',
  args: {
    agendaItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The agenda item unique id'
    }
  },
  async resolve(source, {agendaItemId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    // id is of format 'teamId::shortid'
    const [teamId] = agendaItemId.split('::');
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const agendaItem = await r.table('AgendaItem').get(agendaItemId)
      .delete({returnChanges: true})('changes')(0)('old_val')
      .default(null);
    if (!agendaItem) {
      throw new Error('Agenda item does not exist');
    }
    const data = {agendaItem};
    publish(AGENDA_ITEM, teamId, RemoveAgendaItemPayload, data, subOptions);
    return data;
  }
};
