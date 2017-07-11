import {GraphQLID, GraphQLNonNull, GraphQLList} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {SlackIntegration} from 'server/graphql/models/SlackIntegration/slackIntegrationSchema';
import {requireSUOrTeamMember} from 'server/utils/authorization';

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
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    return r.table('SlackIntegration')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('channelName');
  }
};
