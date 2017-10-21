import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';
import {Team} from '../models/Team/teamSchema';

export default {
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
    if (!team) {
      throw errorObj({_error: 'Team ID not found'});
    }
    return team;
  }
};
