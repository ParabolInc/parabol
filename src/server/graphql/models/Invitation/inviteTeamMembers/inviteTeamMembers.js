import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
} from 'graphql';
import {Invitee} from '../invitationSchema';
import {requireSUOrTeamMember, getUserId, getUserOrgDoc, isBillingLeader} from 'server/utils/authorization';
import {handleSchemaErrors} from 'server/utils/utils';
import asyncInviteTeam from './asyncInviteTeam';
import inviteTeamMemberValidation from './inviteTeamMembersValidation';
import createPendingApprovals from './createPendingApprovals';
import removeOrgApprovalAndNotification from 'server/graphql/models/Organization/rejectOrgApproval/removeOrgApprovalAndNotification';

export default {
  type: GraphQLBoolean,
  description: `If in the org,
     Send invitation emails to a list of email addresses, add them to the invitation table.
     Else, send a request to the org leader to get them approval and put them in the OrgApproval table.
     Returns true if invitation is sent, false if approval is needed`,
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
  async resolve(source, {invitees, teamId}, {authToken}) {
    const r = getRethink();

    // AUTH
    requireSUOrTeamMember(authToken, teamId);
    const userId = getUserId(authToken);
    const {name: teamName, orgId} = await r.table('Team').get(teamId).pluck('name', 'orgId');
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    const inviterIsBillingLeader = isBillingLeader(userOrgDoc);

    // VALIDATION
    const now = Date.now();
    // don't let them invite the same person twice
    const emailArr = invitees.map(invitee => invitee.email);
    const usedEmails = await r.expr(emailArr)
      .do((emails) => {
        return {
          inviteEmails: r.table('Invitation')
            .getAll(r.args(emails), {index: 'email'})
            .filter((invitation) => invitation('tokenExpiration').ge(r.epochTime(now)))('email')
            .coerceTo('array'),
          teamMembers: r.table('TeamMember')
            .getAll(teamId, {index: 'teamId'})
            .merge((teamMember) => ({
              userOrgs: r.table('User').get(teamMember('userId'))('userOrgs')
            }))
            .coerceTo('array'),
          // pendingApprovalEmails: r.table('OrgApproval')
          //   .getAll(r.args(emails), {index: 'email'})
          //   .filter({teamId})('email')
          //   .coerceTo('array')
        }
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
    // const inactiveTeamMemberEmails = inactiveTeamMembers.map((m) => m.email);
    // console.log(inactiveTeamMembers, inactiveTeamMemberEmails)
    const idsToReactivate = [];
    const inviteesNeedingApproval = [];
    for (let i = 0; i < validInvitees.length; i++) {
      const validInvitee = validInvitees[i];
      const inactiveInvitee = inactiveTeamMembers.find((m) => m.email === validInvitee.email);
      if (inactiveInvitee) {
        // if they were previously removed from the team, see if they're still in the org
        const inOrg = Boolean(inactiveInvitee.userOrgs.find((userOrg) => userOrg.id === orgId));
        if (inOrg) {
          // if they're in the org, reactive them
          idsToReactivate.push(inactiveInvitee.id);
        } else {
          // otherwise, they need approval just like the rest
          inviteesNeedingApproval.push(validInvitee);
        }
      } else {
        inviteesNeedingApproval.push(validInvitee);
      }
    }

    if (idsToReactivate.length > 0) {
      r.table('TeamMember')
        .getAll(r.args(idsToReactivate), {index: 'id'})
        .update({isNotRemoved: true})
        .run()
    }

    if (inviteesNeedingApproval.length > 0) {
      const emailsNeedingApproval = inviteesNeedingApproval.map((i) => i.email);
      if (inviterIsBillingLeader) {
        asyncInviteTeam(authToken, teamId, inviteesNeedingApproval);
        // if any folks were pending, remove that status now
        removeOrgApprovalAndNotification(orgId, emailsNeedingApproval);
      } else {
        createPendingApprovals(emailsNeedingApproval, orgId, teamId, teamName, userId);
        // just the approvals were created
        return false;
      }
    }
    return true;
  }
};
