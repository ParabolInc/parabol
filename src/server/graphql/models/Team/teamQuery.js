import {GraphQLNonNull, GraphQLID} from 'graphql';
import {Team} from './teamSchema';
import {errorObj} from 'server/utils/utils';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  getTeamById: {
    type: Team,
    description: 'A query for a team',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The team ID for the desired team'
      }
    },
    async resolve(source, {teamId}, {authToken}) {
      const r = getRethink();
      requireSUOrTeamMember(authToken, teamId);
      const team = await r.table('Team').get(teamId);
      if (team) {
        return team;
      }
      throw errorObj({_error: 'Team ID not found'});
    }
  }
};
