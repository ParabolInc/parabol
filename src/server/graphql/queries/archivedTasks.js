import {GraphQLID, GraphQLNonNull} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {RelayTaskConnection} from 'server/graphql/types/RelayTask';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';
import {PERSONAL} from 'universal/utils/constants';

export default {
  type: RelayTaskConnection,
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
    const oldestTask = tier === PERSONAL ? new Date(Date.now() - ms('14d')) : r.minval;
    const dbAfter = after ? new Date(after) : r.maxval;
    const tasks = await r.table('Task')
    // use a compound index so we can easily paginate later
      .between([teamId, oldestTask], [teamId, dbAfter], {index: 'teamIdUpdatedAt'})
      .filter((task) => task('tags').contains('archived')
        .and(r.branch(
          task('tags').contains('private'),
          task('teamMemberId').eq(teamMemberId),
          true
        )))
      .orderBy(r.desc('updatedAt'))
      .limit(first + 1)
      .coerceTo('array');

    const nodes = tasks.slice(0, first);
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
        hasNextPage: tasks.length > nodes.length
      }
    };
  }
};
