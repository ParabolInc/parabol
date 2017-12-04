import {GraphQLID, GraphQLNonNull} from 'graphql';
import Team from 'server/graphql/types/Team';
import {requireSUOrTeamMember} from 'server/utils/authorization';

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
