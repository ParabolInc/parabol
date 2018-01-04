import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import approveToOrg from 'server/safeMutations/approveToOrg';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import publishBatch from 'server/utils/publishBatch';
import {INVITATION, NOTIFICATION, ORG_APPROVAL, ORGANIZATION} from 'universal/utils/constants';


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

    const data = {removedRequestNotifications, removedOrgApprovals, invitationIds, inviteeApprovedNotifications};

    // tell the other org leaders that the request has been closed
    publish(ORGANIZATION, orgId, ApproveToOrgPayload, data, subOptions);

    // tell the teammembers that the org approval has been removed
    const makeOrgPayload = (val) => ({removedOrgApprovals: val});
    publishBatch(ORG_APPROVAL, 'teamId', ApproveToOrgPayload, removedOrgApprovals, subOptions, makeOrgPayload);

    // tell the teammembers that the org approval was replaced with an invitation
    const makeInvitationPayload = (val) => ({invitationId: val.id});
    publishBatch(INVITATION, 'teamId', ApproveToOrgPayload, newInvitations, subOptions, makeInvitationPayload);

    // tell the inviters that their invitee was approved
    const channelGetter = (val) => val.userIds[0];
    const makeNote = (val) => ({notificationId: val.id});
    publishBatch(NOTIFICATION, channelGetter, ApproveToOrgPayload, inviteeApprovedNotifications, subOptions, makeNote);

    return data;
  }
};

