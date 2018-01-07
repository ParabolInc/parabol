import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import ApproveToOrgPayload from 'server/graphql/types/ApproveToOrgPayload';
import approveToOrg from 'server/safeMutations/approveToOrg';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {INVITATION, NOTIFICATION, ORG_APPROVAL, ORGANIZATION} from 'universal/utils/constants';


export default {
  type: ApproveToOrgPayload,
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
      inviteeApprovedNotifications,
      teamInviteNotifications
    } = await approveToOrg(email, orgId, viewerId);

    const invitationIds = newInvitations.map(({id}) => id);

    const data = {
      removedRequestNotifications,
      removedOrgApprovals,
      invitationIds,
      inviteeApprovedNotifications,
      teamInviteNotifications
    };

    // tell the other org leaders that the request has been closed
    publish(ORGANIZATION, orgId, ApproveToOrgPayload, data, subOptions);

    // tell the teammembers that the org approval has been replaced by an invitation
    const teamIds = Array.from(new Set(removedOrgApprovals.map(({teamId}) => teamId)));
    teamIds.forEach((teamId) => {
      const teamData = {...data, teamIdFilter: teamId};
      publish(ORG_APPROVAL, teamId, ApproveToOrgPayload, teamData, subOptions);
      publish(INVITATION, teamId, ApproveToOrgPayload, teamData, subOptions);
    });

    // tell the inviter that their invitee got approved and sent an invitation
    inviteeApprovedNotifications.forEach((notification) => {
      const {userIds: [inviterUserId]} = notification;
      publish(NOTIFICATION, inviterUserId, ApproveToOrgPayload, data, subOptions);
    });

    // tell the invitee that they've been invited
    if (teamInviteNotifications.length) {
      const [teamInvite] = teamInviteNotifications;
      const {userIds: [inviteeUserId]} = teamInvite;
      publish(NOTIFICATION, inviteeUserId, ApproveToOrgPayload, data, subOptions);
    }
    return data;
  }
};

