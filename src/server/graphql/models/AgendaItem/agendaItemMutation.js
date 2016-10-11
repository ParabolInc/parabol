import getRethink from 'server/database/rethinkDriver';
import {CreateAgendaItemInput, UpdateAgendaItemInput} from './agendaItemSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID
} from 'graphql';
import {requireSUOrTeamMember} from '../authorization';

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
    async resolve(source, {newAgendaItem}, {authToken}) {
      const r = getRethink();
      const [teamId] = newAgendaItem.id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const agendaItem = {
        ...newAgendaItem,
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
    async resolve(source, {id}, {authToken}) {
      const r = getRethink();
      // id is of format 'teamId::restOfAgendaItemId'
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      try {
        await r.table('AgendaItem').get(id).delete();
      } catch (e) {
        console.warning(`removeAgendaItem: exception removing item (${e})`);
        return false;
      }
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
    async resolve(source, {updatedAgendaItem}, {authToken}) {
      const r = getRethink();
      const {id, ...doc} = updatedAgendaItem;
      const [teamId] = id.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const agendaItem = {
        ...doc,
        updatedAt: now,
      };
      await r.table('AgendaItem').get(updatedAgendaItem.id).update(agendaItem);
      return true;
    }
  },
};
