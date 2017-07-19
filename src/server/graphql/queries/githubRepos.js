import {GraphQLID, GraphQLNonNull, GraphQLList} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import GitHubIntegration from 'server/graphql/types/GitHubIntegration';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {GITHUB} from 'universal/utils/constants';

export default {
  type: new GraphQLList(GitHubIntegration),
  description: 'paginated list of slackChannels',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique team Id'
    }
  },
  resolve: async (source, {teamId}, {authToken}) => {
    const r = getRethink();

    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    return r.table(GITHUB)
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('nameWithOwner');
  }
};
