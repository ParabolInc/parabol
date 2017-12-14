import {GraphQLID, GraphQLNonNull, GraphQLList} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import GitHubIntegration from 'server/graphql/types/GitHubIntegration';
import {requireTeamMember} from 'server/utils/authorization';
import {GITHUB} from 'universal/utils/constants';

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
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    return r.table(GITHUB)
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('nameWithOwner');
  }
};
