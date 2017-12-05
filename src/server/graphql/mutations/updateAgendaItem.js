import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateAgendaItemInput from 'server/graphql/types/UpdateAgendaItemInput';
import UpdateAgendaItemPayload from 'server/graphql/types/UpdateAgendaItemPayload';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import {AGENDA_ITEM_UPDATED} from 'universal/utils/constants';
import makeUpdateAgendaItemSchema from 'universal/validation/makeUpdateAgendaItemSchema';

export default {
  type: UpdateAgendaItemPayload,
  description: 'Update an agenda item',
  args: {
    updatedAgendaItem: {
      type: new GraphQLNonNull(UpdateAgendaItemInput),
      description: 'The updated item including an id, content, status, sortOrder'
    }
  },
  async resolve(source, {updatedAgendaItem}, {authToken, getDataLoader, socketId}) {
    const now = new Date();
    const r = getRethink();
    const dataLoader = getDataLoader();
    const operationId = dataLoader.share();

    // AUTH
    const [teamId] = updatedAgendaItem.id.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    const schema = makeUpdateAgendaItemSchema();
    const {errors, data: {id, ...doc}} = schema(updatedAgendaItem);
    handleSchemaErrors(errors);

    // RESOLUTION
    const agendaItem = await r.table('AgendaItem').get(id)
      .update({
        ...doc,
        updatedAt: now
      }, {returnChanges: true})('changes')(0)('new_val')
      .default(null);

    if (!agendaItem) {
      throw new Error('Agenda item does not exist');
    }
    const agendaItemUpdated = {agendaItem};
    getPubSub().publish(`${AGENDA_ITEM_UPDATED}.${teamId}`, {agendaItemUpdated, operationId, mutatorId: socketId});
    return agendaItemUpdated;
  }
};
