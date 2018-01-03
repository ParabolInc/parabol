import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateAgendaItemInput from 'server/graphql/types/UpdateAgendaItemInput';
import UpdateAgendaItemPayload from 'server/graphql/types/UpdateAgendaItemPayload';
import {requireTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {handleSchemaErrors} from 'server/utils/utils';
import {AGENDA_ITEM} from 'universal/utils/constants';
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
  async resolve(source, {updatedAgendaItem}, {authToken, dataLoader, socketId: mutatorId}) {
    const now = new Date();
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const {id: agendaItemId} = updatedAgendaItem;
    const [teamId] = agendaItemId.split('::');
    requireTeamMember(authToken, teamId);

    // VALIDATION
    const schema = makeUpdateAgendaItemSchema();
    const {errors, data: {id, ...doc}} = schema(updatedAgendaItem);
    handleSchemaErrors(errors);

    // RESOLUTION
    await r.table('AgendaItem').get(id)
      .update({
        ...doc,
        updatedAt: now
      });

    const data = {agendaItemId};
    publish(AGENDA_ITEM, teamId, UpdateAgendaItemPayload, data, subOptions);
    return data;
  }
};
