import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import getRequestedFields from 'server/graphql/getRequestedFields';
import {Action} from './actionSchema';
import {requireSUOrSelf, requireSUOrTeamMember, requireTeamIsPaid} from 'server/utils/authorization';
import makeChangefeedHandler from 'server/utils/makeChangefeedHandler';

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
      const r = getRethink();

      // AUTH
      requireSUOrSelf(authToken, userId);


      // RESOLUTION
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
      const r = getRethink();

      // AUTH
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      await requireTeamIsPaid(teamId);

      // RESOLUTION
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
      const r = getRethink();
      const [teamId] = agendaId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      // no need to check if team has paid because they couldn't get this far in the meeting
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
