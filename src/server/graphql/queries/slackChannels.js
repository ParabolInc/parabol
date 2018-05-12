import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import SlackIntegration from 'server/graphql/types/SlackIntegration';
import {isTeamMember} from 'server/utils/authorization';
import {SLACK} from 'universal/utils/constants';
import {sendTeamAccessError} from 'server/utils/authorizationErrors';

export default {
  type: new GraphQLList(SlackIntegration),
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
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId, []);
    }

    // RESOLUTION
    return r
      .table(SLACK)
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('channelName');
  }
};
