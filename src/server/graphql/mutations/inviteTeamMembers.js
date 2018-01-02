import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import Invitee from 'server/graphql/types/Invitee';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import {getUserId, requireOrgLeaderOrTeamMember} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {TEAM} from 'universal/subscriptions/constants';
import {ADDED, NOTIFICATION, ORG_APPROVAL, REJOIN_TEAM, REMOVED, TEAM_MEMBER} from 'universal/utils/constants';
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
      orgApprovalIds,
      reactivations,
      results,
      removedOrgApprovals,
      removedRequestNotifications,
      requestNotifications
    } = await inviteTeamMembers(invitees, teamId, viewerId, subOptions);
    const reactivatedTeamMemberIds = reactivations.map(({teamMemberId}) => teamMemberId);

    // HANDLE REACTIVATION
    reactivations.forEach(({notificationId, teamMemberId, preferredName}) => {
      // send a team member + temporary toast to the rest of the users
      const notification = {type: REJOIN_TEAM, teamId, preferredName};
      publish(TEAM_MEMBER, teamId, ADDED, {teamId, notification}, subOptions);
      // send a team + persisted notification to the reactivated team member
      const {userId} = fromTeamMemberId(teamMemberId);
      publish(TEAM, userId, ADDED, {teamId, notificationId}, subOptions);
    });

    // HANDLE NON-ORG LEADERS NEEDING APPROVAL
    orgApprovalIds.forEach((orgApprovalId) => {
      publish(ORG_APPROVAL, teamId, ADDED, {orgApprovalId}, subOptions);
    });
    requestNotifications.forEach((requestNotification) => {
      const {id: notificationId, userIds} = requestNotification;
      userIds.forEach((userId) => {
        // if the org leader triggers this it won't be in the mutation payload, so mutatorId is not passed in
        publish(NOTIFICATION, userId, ADDED, {notificationId}, {operationId});
      });
    });

    // HANDLE ORG LEADER INVITING A PENDING ORG APPROVAL INVITEE
    const removedOrgApprovalIds = removedOrgApprovals.map(({id}) => id);
    removedOrgApprovalIds.forEach((removedOrgApprovalId) => {
      publish(ORG_APPROVAL, teamId, REMOVED, {removedOrgApprovalId}, subOptions);
    });
    removedRequestNotifications.forEach((notification) => {
      const {userIds} = notification;
      userIds.forEach((userId) => {
        // if the org leader triggers this it won't be in the mutation payload, so mutatorId is not passed in
        publish(NOTIFICATION, userId, REMOVED, {notification}, {operationId});
      });
    });
    return {orgApprovalIds, reactivatedTeamMemberIds, removedOrgApprovalIds, results};
  }
};

