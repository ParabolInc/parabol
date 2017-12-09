import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AddAgendaItemPayload from 'server/graphql/types/AddAgendaItemPayload';
import CreateAgendaItemInput from 'server/graphql/types/CreateAgendaItemInput';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {AGENDA_ITEM_ADDED} from 'universal/utils/constants';
import makeAgendaItemSchema from 'universal/validation/makeAgendaItemSchema';

export default {
  type: AddAgendaItemPayload,
  description: 'Create a new agenda item',
  args: {
    newAgendaItem: {
      type: new GraphQLNonNull(CreateAgendaItemInput),
      description: 'The new task including an id, teamMemberId, and content'
    }
  },
  async resolve(source, {newAgendaItem}, {authToken, dataLoader, socketId}) {
    const r = getRethink();
    const operationId = dataLoader.share();

    // AUTH
    const {teamId} = newAgendaItem;
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    const schema = makeAgendaItemSchema();
    const {errors, data: validNewAgendaItem} = schema(newAgendaItem);
    handleSchemaErrors(errors);

    // RESOLUTION
    const now = new Date();
    const agendaItem = await r.table('AgendaItem').insert({
      id: `${teamId}::${shortid.generate()}`,
      ...validNewAgendaItem,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      isComplete: false,
      teamId
    }, {returnChanges: true})('changes')(0)('new_val');

    const agendaItemAdded = {agendaItem};
    getPubSub().publish(`${AGENDA_ITEM_ADDED}.${teamId}`, {agendaItemAdded, operationId, mutatorId: socketId});
    return agendaItemAdded;
  }
};
