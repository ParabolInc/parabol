import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import rejectOrgApprovalValidation from 'server/graphql/mutations/helpers/rejectOrgApprovalValidation';
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {errorObj, handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {DENY_NEW_USER, NOTIFICATIONS_ADDED} from 'universal/utils/constants';

const publishDenialNotification = (denialNotification, {operationId}) => {
  const userId = denialNotification.userIds[0];
  const notificationsAdded = {notifications: [denialNotification]};
  getPubSub().publish(`${NOTIFICATIONS_ADDED}.${userId}`, {notificationsAdded, operationId});
};

export default {
  type: RejectOrgApprovalPayload,
  description: 'Reject an invitee from joining any team under your organization',
  args: {
    notificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The notification to which the Billing Leader is responding'
    },
    reason: {
      type: GraphQLString
    }
  },
  async resolve(source, args, {authToken, dataLoader, socketId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {operationId, mutatorId: socketId};

    // AUTH
    const {notificationId} = args;
    const userId = getUserId(authToken);
    const rejectionNotification = await r.table('Notification').get(notificationId)
      .pluck('orgId', 'inviterUserId', 'inviteeEmail')
      .default(null);
    if (!rejectionNotification) {
      throw errorObj({reason: `Notification ${notificationId} no longer exists!`});
    }
    const {orgId, inviterUserId, inviteeEmail} = rejectionNotification;
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    const {data: {reason}, errors} = rejectOrgApprovalValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const deniedByName = await r.table('User').get(userId)('preferredName').default('A Billing Leader');
    const denialNotification = {
      id: shortid.generate(),
      type: DENY_NEW_USER,
      startAt: now,
      orgId,
      userIds: [inviterUserId],
      reason,
      deniedByName,
      inviteeEmail
    };

    // TODO include mutatorId in publishes once we're completely on Relay
    const [{removedApprovals, removedNotifications}] = await Promise.all([
      removeOrgApprovalAndNotification(orgId, inviteeEmail, {deniedBy: userId}, subOptions),
      r.table('Notification').insert(denialNotification)
    ]);
    publishDenialNotification(denialNotification, subOptions);

    return {
      notifications: removedNotifications.filter((notification) => notification.userIds.includes(userId)),
      orgApprovals: removedApprovals
    };
  }
};
