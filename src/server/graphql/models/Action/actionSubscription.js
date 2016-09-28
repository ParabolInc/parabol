import r from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {getRequestedFields} from '../utils';
import {Action} from './actionSchema';
import {requireSUOrSelf, requireSUOrTeamMember} from '../authorization';
import makeChangefeedHandler from '../makeChangefeedHandler';

export default {
  actions: {
    type: new GraphQLList(Action),
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique user ID'
      }
    },
    async resolve(source, {userId}, {authToken, socket, subbedChannelName}, refs) {
      requireSUOrSelf(authToken, userId);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Action')
        .getAll(userId, {index: 'userId'})
        .filter({isComplete: false})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  actionsByTeamMember: {
    type: new GraphQLList(Action),
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team member ID'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket, subbedChannelName}, refs) {
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Action')
        .getAll(teamMemberId, {index: 'teamMemberId'})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  actionsByAgenda: {
    type: new GraphQLList(Action),
    args: {
      agendaId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The ID of the agenda that caused this action to be created'
      }
    },
    async resolve(source, {agendaId}, {authToken, socket, subbedChannelName}, refs) {
      const [teamId] = agendaId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Action')
        .getAll(agendaId, {index: 'agendaId'})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
