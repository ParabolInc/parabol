import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getUserId, requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  type: GraphQLInt,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique team ID'
    }
  },
  async resolve(source, {teamId}, {authToken}) {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const teamMemberId = `${userId}::${teamId}`;
    return r.table('Project')
      .between([teamId, r.minval], [teamId, r.maxval], {index: 'teamIdUpdatedAt'})
      .filter((project) => project('tags').contains('archived')
        .and(r.branch(
          project('tags').contains('private'),
          project('teamMemberId').eq(teamMemberId),
          true
        )))
      .count()
      .run();
  }
};
