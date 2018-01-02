import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import approveToOrg from 'server/safeMutations/approveToOrg';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {ADDED, INVITATION, NOTIFICATION, ORG_APPROVAL, REMOVED} from 'universal/utils/constants';


export default {
  type: new GraphQLNonNull(ApproveToOrgPayload),
  description: 'Approve an outsider to join the organization',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLString)
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(source, {email, orgId}, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share();

    // AUTH
    const viewerId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(viewerId, orgId);
    requireOrgLeader(userOrgDoc);

    // RESOLUTION
    const subOptions = {mutatorId, operationId};
    const {
      removedRequestNotifications,
      removedOrgApprovals,
      newInvitations,
      inviteeApprovedNotifications
    } = await approveToOrg(email, orgId, viewerId);

    const invitationIds = newInvitations.map(({id}) => id);

    // tell the other org leaders that the request has been closed
    removedRequestNotifications.forEach((notification) => {
      const {userIds} = notification;
      userIds.forEach((userId) => {
        publish(NOTIFICATION, userId, REMOVED, {notification}, subOptions);
      });
    });

    // tell the teammembers that the org approval has been removed
    removedOrgApprovals.forEach((orgApproval) => {
      const {id: orgApprovalId, teamId} = orgApproval;
      publish(ORG_APPROVAL, teamId, REMOVED, {orgApprovalId}, subOptions);
    });

    // tell the teammembers that the org approval was replaced with an invitation
    newInvitations.forEach((invitation) => {
      const {id: invitationId, teamId} = invitation;
      publish(INVITATION, teamId, ADDED, {invitationId}, subOptions);
    });

    // tell the inviters that their invitee was approved
    inviteeApprovedNotifications.forEach((notification) => {
      const {id: notificationId, userIds} = notification;
      userIds.forEach((userId) => {
        publish(NOTIFICATION, userId, ADDED, {notificationId}, subOptions);
      });
    });

    return {removedRequestNotifications, removedOrgApprovals, invitationIds};
  }
};

