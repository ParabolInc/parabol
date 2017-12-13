import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import Organization from 'server/graphql/types/Organization';
import {requireTeamMember} from 'server/utils/authorization';

export default {
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
      requireTeamMember(authToken, teamId);

      // RESOLUTION
      return r.table('Team').get(teamId)('orgId')
        .do((orgId) => {
          return r.table('Organization').get(orgId);
        })
        .run();
    }
  }
};
