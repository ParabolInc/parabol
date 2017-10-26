import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import getRequestedFields from 'server/graphql/getRequestedFields';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import makeChangefeedHandler from 'server/utils/makeChangefeedHandler';
import Project from 'server/graphql/types/Project';

export default {
  agendaProjects: {
    type: new GraphQLList(Project),
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
      r.table('Project')
        .getAll(agendaId, {index: 'agendaId'})
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  projects: {
    type: new GraphQLList(Project),
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
      r.table('Project')
        .getAll(teamMemberId, {index: 'teamMemberId'})
        .filter((project) => project('tags')
          .contains('private').and(project('teamMemberId').ne(myTeamMemberId))
          .or(project('tags').contains('archived'))
          .not())
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  },
  archivedProjects: {
    type: new GraphQLList(Project),
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
      const oldestProject = new Date(Date.now() - ms('15d'));
      r.table('Project')
      // use a compound index so we can easily paginate later
        .between([teamId, oldestProject], [teamId, r.maxval], {index: 'teamIdCreatedAt'})
        .filter((project) => project('tags').contains('archived')
          .and(r.branch(
            project('tags').contains('private'),
            project('teamMemberId').eq(teamMemberId),
            true
          )))
        .pluck(requestedFields)
        .changes({includeInitial: true})
        .run({cursor: true}, changefeedHandler);
    }
  }
};
