import {GraphQLID, GraphQLNonNull} from 'graphql';
import Team from 'server/graphql/types/Team';
import {requireTeamMember} from 'server/utils/authorization';

export default {
  type: Team,
  description: 'A query for a team',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team ID for the desired team'
    }
  },
  async resolve(source, {teamId}, {authToken, dataLoader}) {
    requireTeamMember(authToken, teamId);
    return dataLoader.get('teams').load(teamId);
  }
};
