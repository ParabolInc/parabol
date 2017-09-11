import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import asyncInviteTeam from 'server/graphql/models/Invitation/inviteTeamMembers/asyncInviteTeam';
import createPendingApprovals from 'server/graphql/models/Invitation/inviteTeamMembers/createPendingApprovals';
import getInviterInfoAndTeamName from 'server/graphql/models/Invitation/inviteTeamMembers/getInviterInfoAndTeamName';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import getResults from 'server/graphql/mutations/helpers/inviteTeamMembers/getResults';
import makeDetailedInvitations from 'server/graphql/mutations/helpers/inviteTeamMembers/makeDetailedInvitations';
import publishNotifications from 'server/graphql/mutations/helpers/inviteTeamMembers/publishNotifications';
import InviteTeamMembersPayload from 'server/graphql/types/InviteTeamMembersPayload';
import reactivateTeamMembersAndMakeNotifications from 'server/safeMutations/reactivateTeamMembersAndMakeNotifications';
import sendInvitationViaNotification from 'server/safeMutations/sendInvitationViaNotification';
import {getUserId, getUserOrgDoc, isBillingLeader, requireOrgLeaderOrTeamMember} from 'server/utils/authorization';
import {ASK_APPROVAL, SEND_EMAIL, SEND_NOTIFICATION} from 'server/utils/serverConstants';
import {REACTIVATED, TEAM_INVITE} from 'universal/utils/constants';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';
import {Invitee} from '../models/Invitation/invitationSchema';
import mergeObjectsWithArrValues from 'universal/utils/mergeObjectsWithArrValues';

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
  async resolve(source, {invitees, teamId}, {authToken}) {
    const r = getRethink();
    const now = Date.now();

    // AUTH
    await requireOrgLeaderOrTeamMember(authToken, teamId);
    const userId = getUserId(authToken);
    const {name: teamName, orgId} = await r.table('Team').get(teamId).pluck('name', 'orgId');
    const userOrgDoc = await getUserOrgDoc(userId, orgId);

    const emailArr = invitees.map((invitee) => invitee.email);
    const {pendingEmailInvitations, pendingNotificationInvitations, pendingApprovals, teamMembers, users} = await r.expr({
      pendingEmailInvitations: r.table('Invitation')
        .getAll(r.args(emailArr), {index: 'email'})
        .filter((invitation) => invitation('tokenExpiration').ge(r.epochTime(now)))('email')
        .coerceTo('array'),
      pendingNotificationInvitations: r.table('Notification')
        .getAll(orgId, {index: 'orgId'})
        .filter({
          type: TEAM_INVITE,
          teamId
        })
        .filter((doc) => r.expr(emailArr).includes(doc('inviteeEmail')))('inviteeEmail')
        .coerceTo('array'),
      pendingApprovals: r.table('OrgApproval')
        .getAll(r.args(emailArr), {index: 'email'})
        .filter({teamId})
        .coerceTo('array'),
      teamMembers: r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .coerceTo('array'),
      users: r.table('User')
        .getAll(r.args(emailArr), {index: 'email'})
        .coerceTo('array')
    });
    const pendingInvitations = pendingEmailInvitations.concat(pendingNotificationInvitations);
    // RESOLUTION
    const inviterAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
    const inviter = {
      ...inviterAndTeamName,
      userId,
      orgId,
      teamId,
      isBillingLeader: isBillingLeader(userOrgDoc)
    };

    const detailedInvitations = makeDetailedInvitations(teamMembers, emailArr, users, pendingApprovals, pendingInvitations, inviter);
    const inviteesToReactivate = detailedInvitations.filter(({action}) => action === REACTIVATED);
    const inviteesToNotify = detailedInvitations.filter(({action}) => action === SEND_NOTIFICATION);
    const inviteesToEmail = detailedInvitations.filter(({action}) => action === SEND_EMAIL);
    const inviteesToApprove = detailedInvitations.filter(({action}) => action === ASK_APPROVAL);
    const approvalEmails = inviteesToApprove.map(({email}) => email);
    const approvalsToClear = inviteesToNotify.concat(inviteesToEmail).map(({email}) => email);

    const {reactivations, notificationsToClear, teamInvites, approvals} = await resolvePromiseObj({
      reactivations: reactivateTeamMembersAndMakeNotifications(inviteesToReactivate, inviter, teamMembers),
      notificationsToClear: removeOrgApprovalAndNotification(orgId, approvalsToClear),
      teamInvites: sendInvitationViaNotification(inviteesToNotify, inviter),
      approvals: createPendingApprovals(approvalEmails, orgId, teamId, teamName, userId),
      emailInvites: asyncInviteTeam(userId, teamId, inviteesToEmail)
    });

    const notificationsToAdd = mergeObjectsWithArrValues(reactivations, teamInvites, approvals);
    publishNotifications({notificationsToAdd, notificationsToClear});
    const results = getResults(detailedInvitations);
    return {results};

    // uncomment this when moving teams to relay
    // getPubSub().publish(`${TEAM_MEMBERS_INVITED}.${teamId}`, {teamMembersInvited, mutatorId: socket.id});
    // return teamMembersInvited;
  }
};

