import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import rejectOrgApprovalValidation from 'server/graphql/models/Organization/rejectOrgApproval/rejectOrgApprovalValidation';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import publishNotifications from 'server/graphql/mutations/helpers/inviteTeamMembers/publishNotifications';
import {getUserId, getUserOrgDoc, requireOrgLeader, requireWebsocket} from 'server/utils/authorization';
import {errorObj, handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {DENY_NEW_USER} from 'universal/utils/constants';

export default {
  type: GraphQLBoolean,
  description: 'Create a new team and add the first team member',
  args: {
    dbNotificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The notification to which the Billing Leader is responding'
    },
    reason: {
      type: GraphQLString
    }
  },
  async resolve(source, args, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    const {dbNotificationId} = args;
    const userId = getUserId(authToken);
    requireWebsocket(socket);
    const rejectionNotification = await r.table('Notification').get(dbNotificationId)
      .pluck('orgId', 'inviterUserId', 'inviteeEmail')
      .default(null);
    if (!rejectionNotification) {
      throw errorObj({reason: `Notification ${dbNotificationId} no longer exists!`});
    }
    const {orgId, inviterUserId, inviteeEmail} = rejectionNotification;
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    const {data: {reason}, errors} = rejectOrgApprovalValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const deniedByName = await r.table('User').get(userId)('preferredName').default('A Billing Leader');
    const notification = {
      id: shortid.generate(),
      type: DENY_NEW_USER,
      startAt: now,
      orgId,
      userIds: [inviterUserId],
      reason,
      deniedByName,
      inviteeEmail
    };

    const [notificationsToClear] = await Promise.all([
      removeOrgApprovalAndNotification(orgId, inviteeEmail),
      r.table('Notification').insert(notification)
    ]);
    const notificationsToAdd = {
      [inviterUserId]: [notification]
    };

    publishNotifications({notificationsToAdd, notificationsToClear});
    return true;
  }
};
