import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import GitHubIntegration from 'server/graphql/types/GitHubIntegration';
import {isTeamMember} from 'server/utils/authorization';
import {GITHUB} from 'universal/utils/constants';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';

export default {
  type: new GraphQLList(GitHubIntegration),
  description: 'list of git hub repos available to the viewer',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique team Id'
    }
  },
  resolve: async (source, {teamId}, {authToken}) => {
    const r = getRethink();

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId, []);
    }

    // RESOLUTION
    return r
      .table(GITHUB)
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('nameWithOwner');
  }
};
