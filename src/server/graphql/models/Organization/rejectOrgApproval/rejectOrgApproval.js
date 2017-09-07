import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLString,
  GraphQLID
} from 'graphql';
import {getUserId, getUserOrgDoc, requireWebsocket, requireOrgLeader} from 'server/utils/authorization';
import {errorObj, handleSchemaErrors} from 'server/utils/utils';
import rejectOrgApprovalValidation from 'server/graphql/models/Organization/rejectOrgApproval/rejectOrgApprovalValidation';
import removeOrgApprovalAndNotification from 'server/graphql/models/Organization/rejectOrgApproval/removeOrgApprovalAndNotification';
import shortid from 'shortid';
import {DENY_NEW_USER, NOTIFICATION_ADDED} from 'universal/utils/constants';
import getPubSub from 'server/utils/getPubSub';

export default {
  type: GraphQLBoolean,
  description: 'Create a new team and add the first team member',
  args: {
    notificationId: {
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
    const userId = getUserId(authToken);
    const {notificationId} = args;
    requireWebsocket(socket);
    const notification = await r.table('Notification').get(notificationId)
      .pluck('orgId', 'varList')
      .default(null);
    if (!notification) {
      throw errorObj({reason: `Notification ${notificationId} no longer exists!`});
    }
    const {orgId, inviterUserId, inviteeEmail} = notification;
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    const {data: {reason}, errors} = rejectOrgApprovalValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const deniedByName = await r.table('User').get(userId)('preferredName').default('A Billing Leader');
    const notificationAdded = {
      id: shortid.generate(),
      type: DENY_NEW_USER,
      startAt: now,
      orgId,
      userIds: [inviterUserId],
      reason,
      deniedByName,
      inviteeEmail
    };

    await Promise.all([
      removeOrgApprovalAndNotification(orgId, inviteeEmail),
      r.table('Notification').insert(notificationAdded)
    ]);
    getPubSub().publish(`${NOTIFICATION_ADDED}.${inviterUserId}`, {notificationAdded});
    return true;
  }
};
