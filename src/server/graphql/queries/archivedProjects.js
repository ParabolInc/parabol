import {GraphQLID, GraphQLNonNull} from 'graphql';
import ms from 'ms';
import getRethink from 'server/database/rethinkDriver';
import {RelayProjectConnection} from 'server/graphql/types/RelayProject';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {forwardConnectionArgs} from 'graphql-relay';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import {PERSONAL} from 'universal/utils/constants';

export default {
  type: RelayProjectConnection,
  args: {
    ...forwardConnectionArgs,
    after: {
      type: GraphQLISO8601Type,
      description: 'the datetime cursor'
    },
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique teamMember ID'
    }
  },
  async resolve(source, {first, after, teamMemberId}, {authToken, socketId}) {
    const r = getRethink();

    // AUTH
    const [, teamId] = teamMemberId.split('::');
    requireSUOrTeamMember(authToken, teamId);

    const tier = await r.table('Team').get(teamId)('tier');
    const oldestProject = tier === PERSONAL ? new Date(Date.now() - ms('14d')) : r.minval;
    const dbAfter = after ? new Date(after) : r.maxval;
    const projects = await r.table('Project')
    // use a compound index so we can easily paginate later
      .between([teamId, oldestProject], [teamId, dbAfter], {index: 'teamIdCreatedAt'})
      .filter((project) => project('tags').contains('archived')
        .and(r.branch(
          project('tags').contains('private'),
          project('teamMemberId').eq(teamMemberId),
          true
        )))

    const {tooManyInvoices, upcomingInvoice} = await resolvePromiseObj({
      tooManyInvoices: r.table('Invoice')
        .between([orgId, r.minval], [orgId, dbAfter], {index: 'orgIdStartAt', leftBound: 'open'})
        .filter((invoice) => invoice('status').ne(UPCOMING).and(invoice('total').ne(0)))
        .orderBy(r.desc('startAt'))
        .limit(first + 1),
      upcomingInvoice: after ? Promise.resolve(undefined) : makeUpcomingInvoice(orgId, stripeId, stripeSubscriptionId)
    });

    const allInvoices = upcomingInvoice ? [upcomingInvoice].concat(tooManyInvoices) : tooManyInvoices;
    const nodes = allInvoices.slice(0, first);
    const edges = nodes.map((node) => ({
      cursor: node.startAt,
      node
    }));
    const firstEdge = edges[0];
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        endCursor: firstEdge && edges[edges.length - 1].cursor,
        hasNextPage: allInvoices.length > nodes.length
      }
    };
  }
}