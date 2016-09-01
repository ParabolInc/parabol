import r from 'server/database/rethinkDriver';
import {CreateAgendaItemInput} from './agendaItemSchema';
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
      const {teamMemberId} = newAgendaItem;
      // teamMemberId is of format 'userId::teamId'
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const now = new Date();
      const agendaItem = {
        ...newAgendaItem,
        createdAt: now,
        isActive: true,
        isCompleted: false,
        teamId
      };
      await r.table('AgendaItem').insert(agendaItem);
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
};
