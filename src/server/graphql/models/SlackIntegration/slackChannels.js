import {GraphQLID, GraphQLNonNull} from 'graphql';
import {connectionArgs, connectionFromArray} from 'graphql-relay';
import getRethink from 'server/database/rethinkDriver';
import {SlackIntegrationConnection} from 'server/graphql/models/SlackIntegration/slackIntegrationSchema';
import {requireSUOrTeamMember} from 'server/utils/authorization';

export default {
  type: SlackIntegrationConnection,
  description: 'paginated list of slackChannels',
  args: {
    ...connectionArgs,
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique team Id'
    }
  },
  resolve: async (source, {teamId, ...conArgs}, {authToken}) => {
    const r = getRethink();

    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const allChannels = await r.table('SlackIntegration')
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('channelName');
    return connectionFromArray(allChannels, conArgs);
  }
};
