import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID} from 'graphql';
import {Organization} from './organizationSchema';
import {requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  orgDetails: {
    type: Organization,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the inviting team'
      }
    },
    async resolve(source, {teamId}, {authToken}) {
      const r = getRethink();

      // AUTH
      const userId = requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      return await r.table('Team').get(teamId)('orgId')
        .do((orgId) => {
          return r.table('Organization').get(orgId)
        });
    }
  }
};
