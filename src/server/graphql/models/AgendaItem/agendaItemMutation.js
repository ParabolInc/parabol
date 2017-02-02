import getRethink from 'server/database/rethinkDriver';
import {CreateAgendaItemInput, UpdateAgendaItemInput} from './agendaItemSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import makeAgendaItemSchema from 'universal/validation/makeAgendaItemSchema';
import {handleSchemaErrors} from 'server/utils/utils';

export default {
  createAgendaItem: {
    type: GraphQLBoolean,
    description: 'Create a new agenda item',
    args: {
      newAgendaItem: {
        type: new GraphQLNonNull(CreateAgendaItemInput),
        description: 'The new task including an id, teamMemberId, and content'
      }
    },
    async resolve(source, {newAgendaItem}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      const [teamId] = newAgendaItem.id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // VALIDATION
      const schema = makeAgendaItemSchema();
      const {errors, data: validNewAgendaItem} = schema(newAgendaItem);
      handleSchemaErrors(errors);

      // RESOLUTION
      const now = new Date();
      const agendaItem = {
        ...validNewAgendaItem,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        isComplete: false,
        teamId
      };
      await r.table('AgendaItem').insert(agendaItem);
      return true;
    }
  },
  removeAgendaItem: {
    type: GraphQLBoolean,
    description: 'Remove an agenda item',
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The agenda item unique id'
      }
    },
    async resolve(source, {id}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      // id is of format 'teamId::restOfAgendaItemId'
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // RESOLUTION
      await r.table('AgendaItem').get(id).delete();
      return true;
    }
  },
  updateAgendaItem: {
    type: GraphQLBoolean,
    description: 'Update an agenda item',
    args: {
      updatedAgendaItem: {
        type: new GraphQLNonNull(UpdateAgendaItemInput),
        description: 'The updated item including an id, content, status, sortOrder'
      }
    },
    async resolve(source, {updatedAgendaItem}, {authToken, socket}) {
      const r = getRethink();

      // AUTH
      const [teamId] = updatedAgendaItem.id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      requireWebsocket(socket);

      // VALIDATION
      const schema = makeAgendaItemSchema();
      const {errors, data: {id, ...doc}} = schema(updatedAgendaItem);
      handleSchemaErrors(errors);

      // RESOLUTION
      const now = new Date();
      const agendaItem = {
        ...doc,
        updatedAt: now,
      };
      await r.table('AgendaItem').get(id).update(agendaItem);
      return true;
    }
  },
};
