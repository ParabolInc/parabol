import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLInt} from 'graphql';
import {requireSUOrTeamMember, requireSUOrSelf} from 'server/utils/authorization';
import Organization from 'server/graphql/types/Organization';

export default {
  orgCount: {
    type: GraphQLInt,
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the user ID that belongs to all the orgs'
      }
    },
    resolve(source, {userId}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireSUOrSelf(authToken, userId);

      // RESOLUTION
      return r.table('Organization')
        .getAll(userId, {index: 'orgUsers'})
        .count()
        .run();
    }
  },
  orgDetails: {
    type: Organization,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the inviting team'
      }
    },
    resolve(source, {teamId}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      return r.table('Team').get(teamId)('orgId')
        .do((orgId) => {
          return r.table('Organization').get(orgId);
        })
        .run();
    }
  }
};
