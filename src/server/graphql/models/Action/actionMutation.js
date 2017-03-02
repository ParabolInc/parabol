import getRethink from 'server/database/rethinkDriver';
import {ActionInput} from './actionSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import makeActionSchema from 'universal/validation/makeActionSchema';
import {handleSchemaErrors} from 'server/utils/utils';
import updateAction from 'server/graphql/models/Action/updateAction/updateAction';

export default {
  updateAction,
  createAction: {
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
      const schema = makeActionSchema();
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
  },
  deleteAction: {
    type: GraphQLBoolean,
    description: 'Delete an action',
    args: {
      actionId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The actionId (teamId::shortid) to delete'
      }
    },
    async resolve(source, {actionId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      const [teamId] = actionId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      await r.table('Action').get(actionId).delete();
    }
  },
  makeProject: {
    type: GraphQLBoolean,
    description: 'Turn an action into a project',
    args: {
      actionId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The actionId (teamId::shortid) to delete'
      }
    },
    async resolve(source, {actionId}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      const [teamId] = actionId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      const action = await r.table('Action').get(actionId);
      const now = new Date();
      const newProject = {
        id: actionId,
        content: action.content,
        isArchived: false,
        teamId,
        teamMemberId: action.teamMemberId,
        createdAt: action.createdAt,
        updatedAt: now,
        status: 'active',
        sortOrder: 0,
        agendaId: action.agendaId
      };
      await r.table('Project').insert(newProject)
        .do(() => {
          return r.table('Action').get(actionId).delete();
        });
    }
  }
};
