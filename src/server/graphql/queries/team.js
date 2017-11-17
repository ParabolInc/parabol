import {GraphQLID, GraphQLNonNull} from 'graphql';
import {requireSUOrTeamMember} from 'server/utils/authorization';
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
  async resolve(source, {teamId}, {authToken, getDataLoader}) {
    requireSUOrTeamMember(authToken, teamId);
    return getDataLoader().teams.load(teamId);
  }
};
