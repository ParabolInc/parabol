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
import {ADD_TO_TEAM, REJOIN_TEAM, PRESENCE, USER_MEMO} from 'universal/subscriptions/constants'

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
  async resolve(source, {invitees, teamId}, {authToken, exchange, unitTestCb}) {
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
        };
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
    const filteredInvitees = [];
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
          filteredInvitees.push(validInvitee);
        }
      } else {
        filteredInvitees.push(validInvitee);
      }
    }

    if (idsToReactivate.length > 0) {
      const userIdsToReactivate = idsToReactivate.map((teamMemberId) => {
        return teamMemberId.substr(0, teamMemberId.indexOf('::'))
      });
      const reactivatedUsers = await r.table('TeamMember')
        .getAll(r.args(idsToReactivate), {index: 'id'})
        .update({isNotRemoved: true})
        .do(() => {
          return r.table('User')
            .getAll(r.args(userIdsToReactivate))
            .update((user) => {
              return user.merge({
                tms: user('tms').append(teamId)
              })
            }, {returnChanges: true})('changes')
            .map((change) => change('new_val'))
        });
      reactivatedUsers.forEach((user) => {
        const {preferredName, id: reactivatedUserId} = user;
        const userChannel = `${USER_MEMO}/${reactivatedUserId}`;
        exchange.publish(userChannel, {type: ADD_TO_TEAM, teamId, teamName});
        const channel = `${PRESENCE}/${teamId}`;
        exchange.publish(channel, {
          type: REJOIN_TEAM,
          name: preferredName,
          sender: userId
        });
      });
    }

    if (filteredInvitees.length > 0) {
      // if it's a billing leader send them all
      const inviteeEmails = filteredInvitees.map((i) => i.email);
      if (inviterIsBillingLeader) {
        // if any folks were pending, remove that status now
        const inviterId = await removeOrgApprovalAndNotification(orgId, inviteeEmails);
        // when we invite the person, try to invite from the original requester, if not, billing leader
        const safeUserId = inviterId || userId;
        asyncInviteTeam(safeUserId, teamId, filteredInvitees, unitTestCb);
        return true;
      }
      // return false if org approvals sent, true if only invites were sent
      return await inviteAsUser(filteredInvitees, orgId, userId, teamId, teamName);
    }
    return undefined;
  }
};
