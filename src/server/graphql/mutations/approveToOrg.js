import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import AddGitHubRepoPayload from 'server/graphql/types/AddGitHubRepoPayload';
import tokenCanAccessRepo from 'server/integrations/tokenCanAccessRepo';
import {getUserId, requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import makeGitHubWebhookParams from 'server/utils/makeGitHubWebhookParams';
import shortid from 'shortid';
import {GITHUB, GITHUB_ENDPOINT} from 'universal/utils/constants';
import makeGitHubPostOptions from 'universal/utils/makeGitHubPostOptions';
import maybeJoinRepos from 'server/safeMutations/maybeJoinRepos';
import removeOrgApprovalAndNotification from 'server/graphql/models/Organization/rejectOrgApproval/removeOrgApprovalAndNotification';

export default {
  name: 'ApproveToOrg',
  type: GraphQLBoolean,
  args: {
    notificationId: {
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  },
  resolve: async (source, {notificationId}, {authToken, socket}) => {
    // AUTH
    const userId = getUserId(authToken);
    const notification = await r.table('Notification')
      .get(notificationId)
      .pluck('orgId', 'userIds', 'varList');

    if (!notification || !notification.userIds.includes(userId)) {
      throw new Error(`Notification ${notificationId} does not exist or ${userId} does not have access to it`);
    }

    // RESOLVE
    const {orgId, varList} = notification;
    const inviteeEmail = varList[2];
    await removeOrgApprovalAndNotification(orgId, inviteeEmail);



  }
};
