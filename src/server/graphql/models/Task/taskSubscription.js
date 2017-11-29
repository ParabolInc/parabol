import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import getRequestedFields from 'server/graphql/getRequestedFields';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import makeChangefeedHandler from 'server/utils/makeChangefeedHandler';
import Task from 'server/graphql/types/Task';

export default {
  agendaTasks: {
    type: new GraphQLList(Task),
    args: {
      agendaId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The ID of the agenda item'
      }
    },
    async resolve(source, {agendaId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();

      // AUTH
      // teamMemberId is of format 'userId::teamId'
      const teamId = await r.table('AgendaItem').get(agendaId)('teamId');
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      const requestedFields = getRequestedFields(refs);
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      r.table('Task')
        .getAll(agendaId, {index: 'agendaId'})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  tasks: {
    type: new GraphQLList(Task),
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique team member ID'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();

      // AUTH
      // teamMemberId is of format 'userId::teamId'
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const myTeamMemberId = `${authToken.sub}::${teamId}`;
      // RESOLUTION
      const requestedFields = getRequestedFields(refs);
      const removalFields = ['id', 'teamMemberId'];
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName, {removalFields});
      r.table('Task')
        .getAll(teamMemberId, {index: 'teamMemberId'})
        .filter((task) => task('tags')
          .contains('private').and(task('teamMemberId').ne(myTeamMemberId))
          .or(task('tags').contains('archived'))
          .not())
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  archivedTasks: {
    type: new GraphQLList(Task),
    args: {
      teamMemberId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The unique teamMember ID'
      }
    },
    async resolve(source, {teamMemberId}, {authToken, socket, subbedChannelName}, refs) {
      const r = getRethink();

      // AUTH
      const [, teamId] = teamMemberId.split('::');
      requireSUOrTeamMember(authToken, teamId);
      const requestedFields = getRequestedFields(refs);
      // const removalFields = ['id', 'isArchived'];
      const changefeedHandler = makeChangefeedHandler(socket, subbedChannelName);
      const oldestTask = new Date(Date.now() - ms('15d'));
      r.table('Task')
      // use a compound index so we can easily paginate later
        .between([teamId, oldestTask], [teamId, r.maxval], {index: 'teamIdCreatedAt'})
        .filter((task) => task('tags').contains('archived')
          .and(r.branch(
            task('tags').contains('private'),
            task('teamMemberId').eq(teamMemberId),
            true
          )))
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
