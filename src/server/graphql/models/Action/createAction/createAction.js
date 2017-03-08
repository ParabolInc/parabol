import getRethink from 'server/database/rethinkDriver';
import {ActionInput} from '../actionSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import createActionValidation from './createActionValidation';

export default {
  type: GraphQLBoolean,
  description: 'Create a new action, triggering a CreateCard for other viewers',
  args: {
    newAction: {
      type: new GraphQLNonNull(ActionInput),
      description: 'The new action including an id, teamMemberId, [agendaId], and sortOrder '
    }
  },
  async resolve(source, {newAction}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const {id} = newAction;
    // format of id is teamId::taskIdPart
    const [teamId] = id.split('::');
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // VALIDATION
    const schema = createActionValidation(authToken.tms);
    const {errors, data: validNewAction} = schema(newAction);
    handleSchemaErrors(errors);

    // RESOLUTION
    const now = new Date();
    const [userId] = validNewAction.teamMemberId.split('::');
    const action = {
      ...validNewAction,
      userId,
      createdAt: now,
      createdBy: authToken.sub,
      updatedAt: now,
      isComplete: false
    };
    await r.table('Action').insert(action);
  }
};
