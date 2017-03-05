import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
} from 'graphql';
import {Invitee} from '../invitationSchema';
import {requireOrgLeaderOrTeamMember, getUserId, getUserOrgDoc, isBillingLeader} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import asyncInviteTeam from './asyncInviteTeam';
import inviteTeamMemberValidation from './inviteTeamMembersValidation';
import removeOrgApprovalAndNotification from 'server/graphql/models/Organization/rejectOrgApproval/removeOrgApprovalAndNotification';
import inviteAsUser from 'server/graphql/models/Invitation/inviteTeamMembers/inviteAsUser';
import reactivateTeamMembers from 'server/graphql/models/Invitation/inviteTeamMembers/reactivateTeamMembers';

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
    },
    // notificationId: {
    //   type: GraphQLID
    // }
  },
  async resolve(source, {invitees, teamId}, {authToken, exchange}) {
    const r = getRethink();

    // AUTH
    await requireOrgLeaderOrTeamMember(authToken, teamId);
    const userId = getUserId(authToken);
    const {name: teamName, orgId} = await r.table('Team').get(teamId).pluck('name', 'orgId');
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    const inviterIsBillingLeader = isBillingLeader(userOrgDoc);

    // VALIDATION
    const now = Date.now();
    // don't let them invite the same person twice
    const emailArr = invitees.map(invitee => invitee.email);
    const usedEmails = await r.expr({
      inviteEmails: r.table('Invitation')
        .getAll(r.args(emailArr), {index: 'email'})
        .filter((invitation) => invitation('tokenExpiration').ge(r.epochTime(now)))('email')
        .coerceTo('array'),
      teamMembers: r.table('TeamMember')
        .getAll(teamId, {index: 'teamId'})
        .merge((teamMember) => ({
          userOrgs: r.table('User').get(teamMember('userId'))('userOrgs').default([])
        }))
        .coerceTo('array'),
    });
    // ignore pendingApprovalEmails because this could be the billing leader hitting accept
    const {inviteEmails, teamMembers} = usedEmails;
    const schemaProps = {
      activeTeamMemberEmails: teamMembers.filter((m) => m.isNotRemoved === true).map((m) => m.email),
      inviteEmails
    };
    const schema = inviteTeamMemberValidation(schemaProps);
    const {errors, data: validInvitees} = schema(invitees);
    handleSchemaErrors(errors);
    // await validateNotificationId(notificationId, authToken);


    // RESOLUTION
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
      // if it's a billing leader send them all
      const inviteeEmails = newInvitees.map((i) => i.email);
      if (inviterIsBillingLeader) {
        // if any folks were pending, release the floodgates, a billing leader has approved them
        const pendingApprovals = await removeOrgApprovalAndNotification(orgId, inviteeEmails);
        // we should always have a fresh invitee, but we do this safety check in case the front-end validation messes up
        const freshInvitees = newInvitees.filter((i) =>
          !pendingApprovals.find((d) => d.inviteeEmail === i.email && d.invitedTeamId === teamId));
        if (freshInvitees) {
          setTimeout(async() =>
            await asyncInviteTeam(userId, teamId, freshInvitees),
          0);
        }
        pendingApprovals.forEach((invite) => {
          const {inviterId, inviteeEmail, invitedTeamId} = invite;
          const invitee = [{email: inviteeEmail}];
          // when we invite the person, try to invite from the original requester, if not, billing leader
          setTimeout(async() =>
            await asyncInviteTeam(inviterId, invitedTeamId, invitee),
          0);
        });

        return true;
      }
      // return false if org approvals sent, true if only invites were sent
      return await inviteAsUser(newInvitees, orgId, userId, teamId, teamName);
    }
    return undefined;
  }
};
