import {GraphQLID, GraphQLNonNull} from 'graphql';
import {forwardConnectionArgs} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import {UserConnection} from 'server/graphql/types/User';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';

export default {
  args: {
    ...forwardConnectionArgs,
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org for which you want the users'
    }
  },
  type: UserConnection,
  async resolve(source, {orgId, first}, {authToken}) {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    // RESOLUTION
    const nodes = await r.table('User')
      .getAll(orgId, {index: 'userOrgs'})
      .orderBy(r.row('preferredName').downcase())
      .limit(first);

    const edges = nodes.map((node) => ({
      cursor: node.preferredName.toLowerCase(),
      node
    }));

    const firstEdge = edges[0];
    return {
      edges,
      pageInfo: {
        endCursor: firstEdge && edges[edges.length - 1].cursor,
        hasNextPage: false
      }
    };
  }
};
