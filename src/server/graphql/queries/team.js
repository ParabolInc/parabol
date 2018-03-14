import {GraphQLID, GraphQLNonNull} from 'graphql';
import Team from 'server/graphql/types/Team';
import {isTeamMember} from 'server/utils/authorization';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';

export default {
  type: new GraphQLNonNull(Team),
  description: 'A query for a team',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team ID for the desired team'
    }
  },
  async resolve(source, {teamId}, {authToken, dataLoader}) {
    if (!isTeamMember(authToken, teamId)) return sendTeamAccessError(authToken, teamId, null);
    return dataLoader.get('teams').load(teamId);
  }
};
