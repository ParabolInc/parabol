import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import rejectOrgApprovalValidation from 'server/graphql/mutations/helpers/rejectOrgApprovalValidation';
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {errorObj, handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {DENY_NEW_USER, NOTIFICATION, ORG_APPROVAL, REMOVED} from 'universal/utils/constants';
import promiseAllObj from 'universal/utils/promiseAllObj';

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
  async resolve(source, args, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {operationId, mutatorId};

    // AUTH
    const {notificationId} = args;
    const viewerId = getUserId(authToken);
    const rejectionNotification = await r.table('Notification').get(notificationId)
      .pluck('orgId', 'inviterUserId', 'inviteeEmail')
      .default(null);
    if (!rejectionNotification) {
      throw errorObj({reason: `Notification ${notificationId} no longer exists!`});
    }
    const {orgId, inviterUserId, inviteeEmail} = rejectionNotification;
    const userOrgDoc = await getUserOrgDoc(viewerId, orgId);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    const {data: {reason}, errors} = rejectOrgApprovalValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const deniedByName = await r.table('User').get(viewerId)('preferredName').default('A Billing Leader');
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
    const {removedApprovalsAndNotifications} = await promiseAllObj({
      removedApprovalsAndNotifications: removeOrgApprovalAndNotification(orgId, inviteeEmail, {deniedBy: viewerId}),
      addNotification: r.table('Notification').insert(denialNotification)
    });

    const {removedOrgApprovals, removedRequestNotifications} = removedApprovalsAndNotifications;
    const removedOrgApprovalIds = removedOrgApprovals.map(({id}) => id);

    // publish the removed org approval to the team
    removedOrgApprovals.forEach((orgApproval) => {
      const {id: orgApprovalId, teamId} = orgApproval;
      publish(ORG_APPROVAL, teamId, REMOVED, {orgApprovalId}, subOptions);
    });

    // publish the removed request notifications to all org leaders
    removedRequestNotifications.forEach((notification) => {
      const {userIds} = notification;
      userIds.forEach((userId) => {
        publish(NOTIFICATION, userId, REMOVED, {notification}, subOptions);
      });
    });
    return {removedOrgApprovalIds, removedRequestNotifications};
  }
};
