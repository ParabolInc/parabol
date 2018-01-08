import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import rejectOrgApprovalValidation from 'server/graphql/mutations/helpers/rejectOrgApprovalValidation';
import RejectOrgApprovalPayload from 'server/graphql/types/RejectOrgApprovalPayload';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {errorObj, handleSchemaErrors} from 'server/utils/utils';
import shortid from 'shortid';
import {DENY_NEW_USER, NOTIFICATION, ORG_APPROVAL} from 'universal/utils/constants';

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
    const rejectionNotification = await r.table('Notification').get(notificationId);
    if (!rejectionNotification) {
      throw errorObj({reason: `Notification ${notificationId} no longer exists!`});
    }
    const {orgId, inviteeEmail} = rejectionNotification;
    const userOrgDoc = await getUserOrgDoc(viewerId, orgId);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    const {data: {reason}, errors} = rejectOrgApprovalValidation()(args);
    handleSchemaErrors(errors);

    // RESOLUTION
    const deniedByName = await r.table('User').get(viewerId)('preferredName').default('A Billing Leader');

    // TODO include mutatorId in publishes once we're completely on Relay
    const {removedOrgApprovals, removedRequestNotifications} =
      await removeOrgApprovalAndNotification(orgId, inviteeEmail, {deniedBy: viewerId});

    const deniedNotifications = removedRequestNotifications.map(({inviterUserId}) => ({
      id: shortid.generate(),
      type: DENY_NEW_USER,
      startAt: now,
      orgId,
      userIds: [inviterUserId],
      reason,
      deniedByName,
      inviteeEmail
    }));
    await r.table('Notification').insert(deniedNotifications);
    const removedOrgApprovalIds = removedOrgApprovals.map(({id}) => id);
    const data = {deniedNotifications, removedOrgApprovalIds, removedRequestNotifications};

    // publish the removed org approval to the team
    removedOrgApprovals.forEach((removedOrgApproval) => {
      const {teamId} = removedOrgApproval;
      const teamData = {...data, teamId}
      publish(ORG_APPROVAL, teamId, RejectOrgApprovalPayload, teamData, subOptions);
    });

    // publish all notifications
    removedRequestNotifications.concat(deniedNotifications).forEach((notification) => {
      const {userIds} = notification;
      userIds.forEach((userId) => {
        publish(NOTIFICATION, userId, RejectOrgApprovalPayload, data, subOptions);
      });
    });

    return data;
  }
};
