import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import asyncInviteTeam from 'server/graphql/models/Invitation/inviteTeamMembers/asyncInviteTeam';
import getInviterInfoAndTeamName from 'server/graphql/models/Invitation/inviteTeamMembers/getInviterInfoAndTeamName';
import inviteAsUser from 'server/graphql/models/Invitation/inviteTeamMembers/inviteAsUser';
import {getUserId, getUserOrgDoc, isBillingLeader, requireOrgLeaderOrTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import tmsSignToken from 'server/utils/tmsSignToken';
import shortid from 'shortid';
import {ADD_TO_TEAM, PRESENCE, REJOIN_TEAM, USER_MEMO} from 'universal/subscriptions/constants';
import {ALREADY_ON_TEAM, PENDING_APPROVAL, REACTIVATED, SUCCESS, TEAM_INVITE} from 'universal/utils/constants';
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

const SEND_NOTIFICATION = 'SEND_NOTIFICATION';
const SEND_EMAIL = 'SEND_EMAIL';
const ASK_APPROVAL = 'ASK_APPROVAL';
//const ASK_APPROVAL_EMAIL = 'ASK_APPROVAL_EMAIL';
//const ASK_APPROVAL_EMAIL_NOTIFICATION = 'ASK_APPROVAL_EMAIL_NOTIFICATION';
//const ASK_APPROVAL_NOTIFICATION = 'ASK_APPROVAL_NOTIFICATION';

const sendNotification = async (invitees, inviter) => {
  if (invitees.length === 0) return invitees;
  const r = getRethink();
  const now = new Date();
  const {orgId, inviterName, teamId, teamName} = inviter;
  const invitations = invitees.map((invitee) => ({
    id: shortid.generate(),
    type: TEAM_INVITE,
    startAt: now,
    orgId,
    userIds: [invitee.userId],
    varList: [inviterName, teamId, teamName]
  }));
  await r.table('Notification').insert(invitations);
  return true;
};

const reactivateAndSendWelcomeBack = async (invitees, inviter, exchange) => {
  if (invitees.length === 0) return invitees;
  const {teamId, teamName} = inviter;
  const r = getRethink();
  const userIds = invitees.map(({userId}) => userId);
  const teamMemberIds = userIds.map((userId) => `${userId}::${teamId}`);
  const reactivatedUsers = await r.table('TeamMember')
    .getAll(r.args(teamMemberIds), {index: 'id'})
    .update({isNotRemoved: true})
    .do(() => {
      return r.table('User')
        .getAll(r.args(userIds))
        .update((user) => {
          return user.merge({
            tms: user('tms').append(teamId)
          });
        }, {returnChanges: true})('changes')('new_val')
        .default(null);
    });
  reactivatedUsers.forEach((user) => {
    const {preferredName, id: reactivatedUserId, tms} = user;
    getPubSub().publish(`${USER_MEMO}/${reactivatedUserId}`, {
      type: ADD_TO_TEAM,
      teamId,
      teamName,
      _authToken: tmsSignToken({sub: reactivatedUserId}, tms)
    });
    const channel = `${PRESENCE}/${teamId}`;
    // TODO refactor out exchange
    exchange.publish(channel, {
      type: REJOIN_TEAM,
      name: preferredName,
      sender: inviter.userId
    });
  });
  return true;
}

//const handleInOrgInvite = async (invitee, inviter) => {
//  const {isNewTeamMember, email, userId} = invitee;
//  if (isNewTeamMember) {
//    await sendNotification(userId, inviter);
//    return {
//      result: SUCCESS,
//      email
//    };
//  } else {
//
//    reactivateAndSendWelcomeBack();
//  }
//};

const getAction = (invitee, inviterIsBillingLeader) => {
  const {
    isActiveTeamMember,
    isPendingApproval,
    isPendingInvitation,
    isActiveUser,
    isNewTeamMember,
    isOrgMember,
  } = invitee;
  if (isActiveTeamMember) return ALREADY_ON_TEAM;
  if (isPendingApproval && !inviterIsBillingLeader) return PENDING_APPROVAL;
  if (isPendingInvitation) return SUCCESS;
  if (isOrgMember) {
    return isNewTeamMember ? SEND_NOTIFICATION : REACTIVATED;
  }
  if (inviterIsBillingLeader) {
    return isActiveUser ? SEND_NOTIFICATION : SEND_EMAIL;
  }
  return ASK_APPROVAL;
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
      users: r.table('User')
        .getAll(r.args(emailArr), {index: 'email'})
        .coerceTo('array')
    });

    //const newInvitations = getInvitationErrors(emailArr, activeTeamMembers, pendingInvitations, pendingApprovals);

    // RESOLUTION
    const activeTeamMembers = teamMembers.filter((m) => m.isNotRemoved === true).map((m) => m.email);
    const inactiveTeamMembers = teamMembers.filter((m) => !m.isNotRemoved).map((m) => m.email);
    const inviterAndTeamName = await getInviterInfoAndTeamName(teamId, userId);
    const inviterDetails = {
      ...inviterAndTeamName,
      orgId,
      teamId,
      isBillingLeader: inviterIsBillingLeader
    };

    const detailedInvitations = emailArr.map((email) => {
      const userDoc = users.find((user) => user.email === email);
      const details = {
        email,
        isActiveTeamMember: activeTeamMembers.includes(email),
        isPendingApproval: pendingApprovals.includes(email),
        isPendingInvitation: pendingInvitations.includes(email),
        isUser: Boolean(userDoc),
        isActiveUser: userDoc && !userDoc.inactive,
        isOrgMember: userDoc && userDoc.userOrgs.includes((userDocOrg) => userDocOrg.id === orgId),
        isNewTeamMember: !inactiveTeamMembers.includes((tm) => tm.email === email),
        userId: userDoc && userDoc.id
      };
      return {
        ...details,
        action: getAction(details, inviterIsBillingLeader)
      }
    });

    const inviteesToNotify = detailedInvitations.filter(({action}) => action === SEND_NOTIFICATION);
    const inviteesToReactivate = detailedInvitations.filter(({action}) => action === REACTIVATED);
    const inviteesToEmail = detailedInvitations.filter(({action}) => action === SEND_EMAIL);
    const approveWithNotification = detailedInvitations.filter(({action}) => action === ASK_APPROVAL_NOTIFICATION || action === ASK_APPROVAL_EMAIL_NOTIFICATION);
    const approveWithEmail = detailedInvitations.filter(({action}) => action === ASK_APPROVAL_EMAIL || action === ASK_APPROVAL_EMAIL_NOTIFICATION);

    const promises = [
      sendNotification(inviteesToNotify, inviterDetails),
      reactivateAndSendWelcomeBack(inviteesToReactivate, inviterDetails),
      asyncInviteTeam(userId, teamId, inviteesToEmail)


    ]

    const results = await Promise.all(detailedInvitations.map((invitee) => {
      const {
        isActiveTeamMember,
        isPendingApproval,
        isPendingInvitation,
        isUser,
        isActiveUser,
        isOrgMember,
        isNewTeamMember
      } = invitee;

    }));


    //const idsToReactivate = [];
    //const newInvitees = [];
    //for (let i = 0; i < validInvitees.length; i++) {
    //  const validInvitee = validInvitees[i];
    //  const inactiveInvitee = inactiveTeamMembers.find((m) => m.email === validInvitee.email);
    //  if (inactiveInvitee) {
    //    // if they were previously removed from the team, see if they're still in the org
    //    const inOrg = Boolean(inactiveInvitee.userOrgs.find((userOrg) => userOrg.id === orgId));
    //    if (inOrg) {
    //      // if they're in the org, reactive them
    //      idsToReactivate.push(inactiveInvitee.id);
    //      continue;
    //    }
    //  }
    //  newInvitees.push(validInvitee);
    //}
    //
    //await reactivateTeamMembers(idsToReactivate, teamId, teamName, exchange, userId);
    //
    //if (newInvitees.length > 0) {
    //  // if it's a Billing Leader send them all
    //  const inviteeEmails = newInvitees.map((i) => i.email);
    //  if (inviterIsBillingLeader) {
    //    // if any folks were pending, release the floodgates, a Billing Leader has approved them
    //    const pendingApprovals = await removeOrgApprovalAndNotification(orgId, inviteeEmails);
    //    // we should always have a fresh invitee, but we do this safety check in case the front-end validation messes up
    //    const freshInvitees = newInvitees.filter((i) =>
    //      !pendingApprovals.find((d) => d.inviteeEmail === i.email && d.invitedTeamId === teamId));
    //    if (freshInvitees) {
    //      setTimeout(async () => {
    //        await asyncInviteTeam(userId, teamId, freshInvitees);
    //      }, 0);
    //    }
    //    pendingApprovals.forEach((invite) => {
    //      const {inviterId, inviteeEmail, invitedTeamId} = invite;
    //      const invitee = [{email: inviteeEmail}];
    //      // when we invite the person, try to invite from the original requester, if not, Billing Leader
    //      setTimeout(async () => {
    //        await asyncInviteTeam(inviterId, invitedTeamId, invitee);
    //      }, 0);
    //    });
    //
    //    return true;
    //  }
    //  // return false if org approvals sent, true if only invites were sent
    return inviteAsUser(newInvitees, orgId, userId, teamId, teamName);
    //}
    return undefined;
  }
};

