import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getInviterInfoAndTeamName from 'server/graphql/models/Invitation/inviteTeamMembers/getInviterInfoAndTeamName';
import {getUserId, getUserOrgDoc, isBillingLeader, requireOrgLeaderOrTeamMember} from 'server/utils/authorization';
import shortid from 'shortid';
import {ALREADY_ON_TEAM, PENDING_APPROVAL, SUCCESS, TEAM_INVITE} from 'universal/utils/constants';
import {Invitee} from '../invitationSchema';


//const determineInviteeAction = (invitee) => {
//  const {
//    isActiveTeamMember,
//    isPendingApproval,
//    isPendingInvitation,
//    isUser,
//    isActiveUser,
//    isOrgMember,
//    isNewTeamMember,
//  } = invitee;
//  if (isActiveTeamMember) {
//    return
//  }
//}

const sendNotification = async (invitee, inviter) => {
  const r = getRethink();
  const now = new Date();
  const {userId} = invitee;
  const {orgId, inviterName, teamId, teamName} = inviter;
  await r.table('Notification').insert({
    id: shortid.generate(),
    type: TEAM_INVITE,
    startAt: now,
    orgId,
    userIds: [userId],
    varList: [inviterName, teamId, teamName]
  })
  return {
    result: SUCCESS,
    userId
  }
};
const handleInOrgInvite = async (invitee, inviter) => {
  const {isNewTeamMember} = invitee;
  if (isNewTeamMember) {
    sendNotification(invitee, inviter);
  } else {
    reactivateAndSendWelcomeBack();
  }
};

//const getInvitationErrors = (inviteeEmails, activeTeamMembers = [], pendingInvitations = [], pendingApprovals = []) => {
//  const getInviteeError = (inviteeEmail) => {
//    if (activeTeamMembers.includes(inviteeEmail)) {
//      return 'member'
//    }
//    if (pendingInvitations.includes(inviteeEmail)) {
//      return 'invited'
//    }
//    if (pendingApprovals.includes(inviteeEmail)) {
//      return 'pending'
//    }
//    return undefined;
//  };
//
//  return inviteeEmails.map((inviteeEmail) => ({
//    email: inviteeEmail,
//    error: getInviteeError(inviteeEmail)
//  }));
//};

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
    const {pendingInvitations, pendingApprovals, teamMembers, users} = await r.expr({
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
        //.merge((teamMember) => ({
        //  userOrgs: r.table('User').get(teamMember('userId'))('userOrgs').default([])
        //}))
        .coerceTo('array'),
      users: r.table('User').getAll(r.args(emailArr), {index: 'email'})
    });
    const activeTeamMembers = teamMembers.filter((m) => m.isNotRemoved === true).map((m) => m.email);
    const inactiveTeamMembers = teamMembers.filter((m) => !m.isNotRemoved).map((m) => m.email);
    const newInvitations = getInvitationErrors(emailArr, activeTeamMembers, pendingInvitations, pendingApprovals);

    // RESOLUTION
    const inviterAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
    const inviterDetails = {
      ...inviterAndTeamName,
      orgId
    };

    //const errorFreeInvitations = newInvitations.filter((invite) => !invite.error);
    const detailedInvitations = emailArr.map((email) => {
      const userDoc = users.find((user) => user.email === email);
      return {
        email,
        isActiveTeamMember: activeTeamMembers.includes(email),
        isPendingApproval: pendingApprovals.includes(email),
        isPendingInvitation: pendingInvitations.includes(email),
        isUser: Boolean(userDoc),
        isActiveUser: userDoc && !userDoc.inactive,
        isOrgMember: userDoc && userDoc.userOrgs.includes((userOrgDoc) => userOrgDoc.id === orgId),
        isNewTeamMember: !inactiveTeamMembers.includes((tm) => tm.email === email),
        userId: userDoc
      };
    });

    const results = detailedInvitations.map((invitee) => {
      const {
        isActiveTeamMember,
        isPendingApproval,
        isPendingInvitation,
        isUser,
        isActiveUser,
        isOrgMember,
        isNewTeamMember
      } = invitee;
      if (isActiveTeamMember) {
        return ALREADY_ON_TEAM;
      }
      if (isPendingApproval) {
        return PENDING_APPROVAL;
      }
      if (isPendingInvitation) {
        // if they want to resend the invite, they need to click the button
        return SUCCESS;
      }
      if (isActiveUser && isOrgMember) {
        return handleInOrgInvite(invitee, inviterDetails);
      }

      //email: invitee.email,
      //action: determineInviteeAction(invitee)

    })

    detailedInvitations.forEach((invitee) => {
      const {isUser, isActiveUser, isOrgMember} = invitee;


      if (isBillingLeader()) {
        if (!isActiveUser) {
          sendEmail()
        } else if (!isOrgMember) {
          sendNotification();
        }
      } else {
        if (isUser) {
          if (isActiveUser) {
            askForApproval(useNotification);
          } else {
            askForApproval(useNotification, useEmail);
          }
        } else {
          askForApproval(useEmail);
        }
      }
    })

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

