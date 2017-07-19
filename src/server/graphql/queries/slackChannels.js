import {GraphQLID, GraphQLNonNull, GraphQLList} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import SlackIntegration from 'server/graphql/types/SlackIntegration';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {SLACK} from 'universal/utils/constants';

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
    return r.table(SLACK)
      .getAll(teamId, {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('channelName');
  }
};
