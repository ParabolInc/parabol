import {GraphQLNonNull, GraphQLID} from 'graphql';
import {Team} from './teamSchema';
import {errorObj} from '../utils';
import {requireSUOrTeamMember} from '../authorization';
export default {
  getTeamById: {
    type: Team,
    description: 'Get a team by the team ID',
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The ID for the desired team'
      }
    },
    async resolve(source, {teamId}, {authToken}) {
      requireSUOrTeamMember(authToken, teamId);
      const team = await r.table('Team').get(teamId);
      if (team) {
        return team;
      }
      throw errorObj({_error: 'Team not found'});
    }
  }
};
