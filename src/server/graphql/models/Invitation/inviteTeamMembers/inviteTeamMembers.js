import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import inviteAsUser from 'server/graphql/models/Invitation/inviteTeamMembers/inviteAsUser';
import reactivateTeamMembers from 'server/graphql/models/Invitation/inviteTeamMembers/reactivateTeamMembers';
import removeOrgApprovalAndNotification from 'server/graphql/models/Organization/rejectOrgApproval/removeOrgApprovalAndNotification';
import {getUserId, getUserOrgDoc, isBillingLeader, requireOrgLeaderOrTeamMember} from 'server/utils/authorization';
import {Invitee} from '../invitationSchema';
import asyncInviteTeam from './asyncInviteTeam';

const getInvitationErrors = (inviteeEmails, activeTeamMembers = [], pendingInvitations = [], pendingApprovals = []) => {
  const getInviteeError = (inviteeEmail) => {
    if (activeTeamMembers.includes(inviteeEmail)) {
      return 'member'
    }
    if (pendingInvitations.includes(inviteeEmail)) {
      return 'invited'
    }
    if (pendingApprovals.includes(inviteeEmail)) {
      return 'pending'
    }
    return undefined;
  };

  return inviteeEmails.map((inviteeEmail) => ({
    email: inviteeEmail,
    error: getInviteeError(inviteeEmail)
  }));
};

export default {
  type: GraphQLBoolean,
  description: `If in the org,
     Send invitation emails to a list of email addresses, add them to the invitation table.
     Else, send a request to the org leader to get them approval and put them in the OrgApproval table.
     Returns true if invitation is sent, false if approval is needed, undefined/null if neither`,
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the inviting team'
    },
    invitees: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Invitee)))
    }
    // notificationId: {
    //   type: GraphQLID
    // }
  },
  async resolve(source, {invitees, teamId}, {authToken, exchange}) {
    const r = getRethink();
    const now = Date.now();

    // AUTH
    await requireOrgLeaderOrTeamMember(authToken, teamId);
    const userId = getUserId(authToken);
    const {name: teamName, orgId} = await r.table('Team').get(teamId).pluck('name', 'orgId');
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    const inviterIsBillingLeader = isBillingLeader(userOrgDoc);

    // VALIDATION
    // don't let them invite the same person twice
    const emailArr = invitees.map((invitee) => invitee.email);
    const {pendingInvitations, pendingApprovals, teamMembers} = await r.expr({
      pendingInvitations: r.table('Invitation')
        .getAll(r.args(emailArr), {index: 'email'})
        .filter((invitation) => invitation('tokenExpiration').ge(r.epochTime(now)))('email')
        .coerceTo('array'),
      pendingApprovals: r.table('OrgApproval')
        .getAll(r.args(emailArr), {index: 'email'})
        .filter({teamId})
        .coerceTo('array'),
      teamMembers: r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .merge((teamMember) => ({
          userOrgs: r.table('User').get(teamMember('userId'))('userOrgs').default([])
        }))
        .coerceTo('array')
    });
    const activeTeamMembers = teamMembers.filter((m) => m.isNotRemoved === true).map((m) => m.email);
    const newInvitations = getInvitationErrors(emailArr, activeTeamMembers, pendingInvitations, pendingApprovals);

    // RESOLUTION
    const errorFreeInvitations = newInvitations.filter((invite) => !invite.error);
    const inactiveTeamMembers = teamMembers.filter((m) => m.isNotRemoved === false);
    const idsToReactivate = [];
    const newInvitees = [];
    for (let i = 0; i < validInvitees.length; i++) {
      const validInvitee = validInvitees[i];
      const inactiveInvitee = inactiveTeamMembers.find((m) => m.email === validInvitee.email);
      if (inactiveInvitee) {
        // if they were previously removed from the team, see if they're still in the org
        const inOrg = Boolean(inactiveInvitee.userOrgs.find((userOrg) => userOrg.id === orgId));
        if (inOrg) {
          // if they're in the org, reactive them
          idsToReactivate.push(inactiveInvitee.id);
          continue;
        }
      }
      newInvitees.push(validInvitee);
    }

    await reactivateTeamMembers(idsToReactivate, teamId, teamName, exchange, userId);

    if (newInvitees.length > 0) {
      // if it's a Billing Leader send them all
      const inviteeEmails = newInvitees.map((i) => i.email);
      if (inviterIsBillingLeader) {
        // if any folks were pending, release the floodgates, a Billing Leader has approved them
        const pendingApprovals = await removeOrgApprovalAndNotification(orgId, inviteeEmails);
        // we should always have a fresh invitee, but we do this safety check in case the front-end validation messes up
        const freshInvitees = newInvitees.filter((i) =>
          !pendingApprovals.find((d) => d.inviteeEmail === i.email && d.invitedTeamId === teamId));
        if (freshInvitees) {
          setTimeout(async () => {
            await asyncInviteTeam(userId, teamId, freshInvitees);
          }, 0);
        }
        pendingApprovals.forEach((invite) => {
          const {inviterId, inviteeEmail, invitedTeamId} = invite;
          const invitee = [{email: inviteeEmail}];
          // when we invite the person, try to invite from the original requester, if not, Billing Leader
          setTimeout(async () => {
            await asyncInviteTeam(inviterId, invitedTeamId, invitee);
          }, 0);
        });

        return true;
      }
      // return false if org approvals sent, true if only invites were sent
      return inviteAsUser(newInvitees, orgId, userId, teamId, teamName);
    }
    return undefined;
  }
};
