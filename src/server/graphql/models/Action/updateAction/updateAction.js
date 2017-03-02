import getRethink from 'server/database/rethinkDriver';
import {ActionInput} from 'server/graphql/models/Action/actionSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import updateActionValidation from 'server/graphql/models/Action/updateAction/updateActionValidation';

export default {
  type: GraphQLBoolean,
  description: 'Update a action with a change in content, ownership, or status',
  args: {
    updatedAction: {
      type: new GraphQLNonNull(ActionInput),
      description: 'the updated action including the id, and at least one other field'
    },
  },
  async resolve(source, {updatedAction}, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    requireWebsocket(socket);
    const [teamId] = updatedAction.id.split('::');
    requireSUOrTeamMember(authToken, teamId);

    // VALIDATION
    const schema = updateActionValidation(authToken.tms);
    const {errors, data: {id: actionId, ...validAction}} = schema(updatedAction);
    handleSchemaErrors(errors);

    // RESOLUTION
    const newAction = {
      ...validAction,
      // don't update updatedAt for sortOrder changes
      updatedAt: (Object.keys(validAction).length > 1 || validAction.sortOrder === undefined) ? now : undefined
    };
    await r.table('Action').get(actionId).update(newAction);
    return true;
  }
};
