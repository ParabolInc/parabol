import getRethink from 'server/database/rethinkDriver';
import {CreateActionInput, UpdateActionInput} from './actionSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireSUOrTeamMember, requireWebsocket} from '../authorization';
import makeActionSchema from 'universal/validation/makeActionSchema';
import {handleSchemaErrors} from '../utils';
export default {
  updateAction: {
    type: GraphQLBoolean,
    description: 'Update a action with a change in content, ownership, or status',
    args: {
      updatedAction: {
        type: new GraphQLNonNull(UpdateActionInput),
        description: 'the updated action including the id, and at least one other field'
      },
      rebalance: {
        type: GraphQLBoolean,
        description: 'true if we should resort the action list because the float resolution has gotten too small'
      }
    },
    async resolve(source, {updatedAction, rebalance}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      const [teamId] = updatedAction.id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // VALIDATION
      const schema = makeActionSchema();
      const {errors, data: {id: actionId, ...action}} = schema(updatedAction);
      handleSchemaErrors(errors);

      // RESOLUTION
      const now = new Date();
      const newAction = {
        ...action,
        updatedAt: now
      };
      const {teamMemberId} = action;
      if (teamMemberId) {
        const [userId] = teamMemberId.split('::');
        newAction.userId = userId;
      }
      // we could possibly combine this into the rebalance if we did a resort on the server, but separate logic is nice
      await r.table('Action').get(actionId).update(newAction);
      if (rebalance) {
        const rebalanceCountPromise = await r.table('Action')
          .getAll(authToken.sub, {index: 'userId'})
          .orderBy('sortOrder')('id');
        const updates = rebalanceCountPromise.map((id, idx) => ({id, idx}));
        await r.expr(updates)
          .forEach((update) => {
            return r.table('Action')
              .get(update('id'))
              .update({sortOrder: update('idx')});
          });
      }
      return true;
    }
  },
  createAction: {
    type: GraphQLBoolean,
    description: 'Create a new action, triggering a CreateCard for other viewers',
    args: {
      newAction: {
        type: new GraphQLNonNull(CreateActionInput),
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
        teamSort: 0,
        userSort: 0,
        agendaId: action.agendaId
      };
      await r.table('Project').insert(newProject)
        .do(() => {
          return r.table('Action').get(actionId).delete();
        });
    }
  }
};
