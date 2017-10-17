import {GraphQLID, GraphQLNonNull} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {RelayProjectConnection} from 'server/graphql/types/RelayProject';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import {PERSONAL} from 'universal/utils/constants';

export default {
  type: RelayProjectConnection,
  args: {
    ...forwardConnectionArgs,
    after: {
      type: GraphQLISO8601Type,
      description: 'the datetime cursor'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique team ID'
    }
  },
  async resolve(source, {first, after, teamId}, {authToken}) {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const teamMemberId = `${userId}::${teamId}`;
    const tier = await r.table('Team').get(teamId)('tier');
    const oldestProject = tier === PERSONAL ? new Date(Date.now() - ms('14d')) : r.minval;
    const dbAfter = after ? new Date(after) : r.maxval;
    const projects = await r.table('Project')
    // use a compound index so we can easily paginate later
      .between([teamId, oldestProject], [teamId, dbAfter], {index: 'teamIdUpdatedAt'})
      .filter((project) => project('tags').contains('archived')
        .and(r.branch(
          project('tags').contains('private'),
          project('teamMemberId').eq(teamMemberId),
          true
        )))
      .orderBy(r.desc('updatedAt'))
      .limit(first + 1)
      .coerceTo('array');

    const nodes = projects.slice(0, first);
    const edges = nodes.map((node) => ({
      cursor: node.updatedAt,
      node
    }));
    const firstEdge = edges[0];
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        endCursor: firstEdge ? edges[edges.length - 1].cursor : new Date(),
        hasNextPage: projects.length > nodes.length
      }
    };
  }
};
