import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {getIsTeamLead, requireSUOrSelf, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {errorObj} from 'server/utils/utils';

export default {
  type: GraphQLBoolean,
  description: 'Remove a slack channel integration from a team',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the teamMember calling it.'
    },
    slackIntegrationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the unique id for this slack integration'
    }
  },
  async resolve(source, {teamMemberId, slackIntegrationId}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const [userId, teamId] = teamMemberId.split('::');
    requireSUOrSelf(authToken, userId);
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);


    // VALIDATION

    // make sure the callers userId is on the integration list of users or is the team lead
    const integration = await r.table('SlackIntegration').get(slackIntegrationId);
    if (!integration.userIds.includes(userId)) {
      const isTeamLead = await getIsTeamLead(teamMemberId);
      if (!isTeamLead) {
        throw errorObj({_error: `You must be linked or the team lead to remove that integration ${slackIntegrationId}`});
      }
    }

    // RESOLUTION
    await r.table('SlackIntegration').get(slackIntegrationId)
      .update({
        isActive: false,
        userIds: []
      });
    return true;
  }
};

