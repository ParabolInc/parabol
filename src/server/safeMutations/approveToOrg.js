import getRethink from 'server/database/rethinkDriver';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import {APPROVED, PENDING} from 'server/utils/serverConstants';
import shortid from 'shortid';
import {INVITEE_APPROVED, REQUEST_NEW_USER} from 'universal/utils/constants';

const approveToOrg = async (email, orgId, userId, dataLoader) => {
  const r = getRethink();
  const now = new Date();
  // get all notifications for this email to join this org
  const removedNotifications = await r.table('Notification')
    .getAll(userId, {index: 'userIds'})
    .filter({
      orgId,
      type: REQUEST_NEW_USER,
      inviteeEmail: email
    })
    .delete({returnChanges: true})('changes')('old_val')
    .default([]);
  if (removedNotifications.length === 0) {
    throw new Error('Notification not found!', email, orgId, userId);
  }
  // RESOLUTION
  // send 1 team invite per notification
  const inviterUserIds = Array.from(removedNotifications.reduce((userIds, notification) => {
    return userIds.add(notification.inviterUserId);
  }, new Set()));

  const teamIds = removedNotifications.map(({teamId}) => teamId);
  const {inviterUsers, teams} = await r({
    inviterUsers: r.table('User')
      .getAll(r.args(inviterUserIds), {index: 'id'})
      .pluck('id', 'email', 'picture', 'preferredName')
      .coerceTo('array'),
    teams: r.table('Team')
      .getAll(r.args(teamIds), {index: 'id'})
      .pluck('id', 'name')
      .coerceTo('array')
  });
  const inviters = removedNotifications.map((notification) => {
    const inviterUser = inviterUsers.find(({id}) => id === notification.inviterUserId);
    const team = teams.find(({id}) => id === notification.teamId);
    return {
      inviterUserId: inviterUser.id,
      inviterAvatar: inviterUser.picture,
      inviterEmail: inviterUser.email,
      inviterName: inviterUser.preferredName,
      teamName: team.name,
      orgId,
      teamId: team.id,
      userId: inviterUser.id
    };
  });
  const inviteeApprovedNotifications = inviters.map((inviter) => {
    const {inviterName, userId: inviterUserId, teamId, teamName} = inviter;
    return {
      id: shortid.generate(),
      type: INVITEE_APPROVED,
      startAt: now,
      orgId,
      userIds: [inviterUserId],
      inviteeEmail: email,
      inviterName,
      teamId,
      teamName
    };
  });

  // tell the inviters that their friend was approved
  // send the invitee a series of team invites
  const {inviteeUser, removedOrgApprovals} = await r({
    insertInviteeApproved: r.table('Notification').insert(inviteeApprovedNotifications),
    removedOrgApprovals: r.table('OrgApproval')
      .getAll(email, {index: 'email'})
      .filter({orgId, status: PENDING, isActive: true})
      .update({
        status: APPROVED,
        approvedBy: userId,
        updatedAt: now
      }, {returnChanges: true})('changes')('new_val')
      .default([]),
    inviteeUser: r.table('User').getAll(email, {index: 'email'}).nth(0).default(null)
  });

  const invitees = inviteeUser ? [{email, userId: inviteeUser.id}] : [{email}];

  const sentTeamInvitations = await Promise.all(inviters.map((inviter) => {
    return sendTeamInvitations(invitees, inviter, undefined, dataLoader);
  }));

  const newInvitations = sentTeamInvitations.reduce((arr, upserts) => {
    arr.push(...upserts.newInvitations);
    return arr;
  }, []);

  const teamInviteNotifications = sentTeamInvitations.reduce((arr, upserts) => {
    arr.push(...upserts.teamInviteNotifications);
    return arr;
  }, []);

  return {
    removedRequestNotifications: removedNotifications,
    removedOrgApprovals,
    newInvitations,
    inviteeApprovedNotifications,
    teamInviteNotifications
  };
};

export default approveToOrg;

