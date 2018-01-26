import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import Invitee from 'server/graphql/types/Invitee';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import {getUserId, requireOrgLeaderOrTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {INVITATION, NOTIFICATION, ORG_APPROVAL, TEAM_MEMBER} from 'universal/utils/constants';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

export default {
  type: new GraphQLNonNull(InviteTeamMembersPayload),
  description: `If in the org,
     Send invitation emails to a list of email addresses, add them to the invitation table.
     Else, send a request to the org leader to get them approval and put them in the OrgApproval table.`,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the inviting team'
    },
    invitees: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Invitee)))
    }
  },
  async resolve(source, {invitees, teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const operationId = dataLoader.share();
    // AUTH
    await requireOrgLeaderOrTeamMember(authToken, teamId);
    const viewerId = getUserId(authToken);

    // RESOLUTION
    const subOptions = {mutatorId, operationId};
    const {
      billingLeaderUserIds,
      orgApprovalIds,
      reactivations,
      removedOrgApprovals,
      removedRequestNotifications,
      requestNotifications,
      newInvitations,
      newSoftTeamMembers,
      teamInviteNotifications: inviteNotifications
    } = await inviteTeamMembers(invitees, teamId, viewerId, subOptions);
    const reactivatedTeamMemberIds = reactivations.map(({teamMemberId}) => teamMemberId);
    const reactivationNotificationIds = reactivations.map(({notificationId}) => notificationId);
    const removedOrgApprovalIds = removedOrgApprovals.map(({id}) => id);
    const invitationIds = newInvitations.map(({id}) => id);

    const data = {
      orgApprovalIds,
      removedOrgApprovalIds,
      reactivatedTeamMemberIds,
      teamId,
      reactivationNotificationIds,
      removedRequestNotifications,
      requestNotifications,
      invitationIds,
      inviteNotifications,
      softTeamMemberIds: newSoftTeamMembers.map(({id}) => id)
    };

    // Tell each invitee
    reactivations.forEach(({teamMemberId}) => {
      const {userId} = fromTeamMemberId(teamMemberId);
      publish(NOTIFICATION, userId, InviteTeamMembersPayload, data, subOptions);
    });

    inviteNotifications.forEach((notification) => {
      const {userIds: [userId]} = notification;
      publish(NOTIFICATION, userId, InviteTeamMembersPayload, data, subOptions);
    });

    // tell the billing leaders (added or removed org approval requests)
    if (requestNotifications.length || removedRequestNotifications.length) {
      billingLeaderUserIds.forEach((userId) => {
        publish(NOTIFICATION, userId, InviteTeamMembersPayload, data, subOptions);
      });
    }

    // tell the rest of the team
    if (orgApprovalIds.length || removedOrgApprovalIds.length) {
      publish(ORG_APPROVAL, teamId, InviteTeamMembersPayload, data, subOptions);
    }
    if (invitationIds.length) {
      publish(INVITATION, teamId, InviteTeamMembersPayload, data, subOptions);
    }
    if (reactivatedTeamMemberIds.length || newSoftTeamMembers.length) {
      publish(TEAM_MEMBER, teamId, InviteTeamMembersPayload, data, subOptions);
    }
    return data;
  }
};

