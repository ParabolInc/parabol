import {GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateAgendaItemInput from 'server/graphql/types/UpdateAgendaItemInput';
import UpdateAgendaItemPayload from 'server/graphql/types/UpdateAgendaItemPayload';
import {isTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {AGENDA_ITEM} from 'universal/utils/constants';
import makeUpdateAgendaItemSchema from 'universal/validation/makeUpdateAgendaItemSchema';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';
import sendFailedInputValidation from 'server/utils/sendFailedInputValidation';

export default {
  type: UpdateAgendaItemPayload,
  description: 'Update an agenda item',
  args: {
    updatedAgendaItem: {
      type: new GraphQLNonNull(UpdateAgendaItemInput),
      description: 'The updated item including an id, content, status, sortOrder'
    }
  },
  async resolve (source, {updatedAgendaItem}, {authToken, dataLoader, socketId: mutatorId}) {
    const now = new Date();
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const {id: agendaItemId} = updatedAgendaItem;
    const [teamId] = agendaItemId.split('::');
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId);
    }

    // VALIDATION
    const schema = makeUpdateAgendaItemSchema();
    const {
      errors,
      data: {id, ...doc}
    } = schema(updatedAgendaItem);
    if (Object.keys(errors).length) {
      return sendFailedInputValidation(authToken, errors);
    }

    // RESOLUTION
    await r
      .table('AgendaItem')
      .get(id)
      .update({
        ...doc,
        updatedAt: now
      });

    const data = {agendaItemId};
    publish(AGENDA_ITEM, teamId, UpdateAgendaItemPayload, data, subOptions);
    return data;
  }
};
