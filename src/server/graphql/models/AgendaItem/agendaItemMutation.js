import r from 'server/database/rethinkDriver';
import {CreateAgendaItemInput} from './agendaItemSchema';
import {
  GraphQLNonNull,
  GraphQLBoolean
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
      const [userId, teamId] = teamMemberId.split('::');
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
  }
};
