import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import addUserToTMSUserOrg from 'server/safeMutations/addUserToTMSUserOrg';
import insertNewTeamMember from 'server/safeMutations/insertNewTeamMember';
import getTeamInviteNotifications from 'server/safeQueries/getTeamInviteNotifications';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {ADD_USER} from 'server/utils/serverConstants';
import tmsSignToken from 'server/utils/tmsSignToken';
import {
  ADD_TO_TEAM, ADDED, INVITATION_REMOVED, JOIN_TEAM, NEW_AUTH_TOKEN, NOTIFICATIONS_ADDED, NOTIFICATIONS_CLEARED,
  TEAM_ADDED, TEAM_MEMBER
} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const publishRemovedInvitations = (expiredEmailInvitations, operationId) => {
  expiredEmailInvitations.forEach((invitation) => {
    const {teamId} = invitation;
    const invitationRemoved = {invitation};
    getPubSub().publish(`${INVITATION_REMOVED}.${teamId}`, {invitationRemoved, operationId});
  });
};

const publishClearNotifications = (expireInviteNotificationIds, userId) => {
  if (expireInviteNotificationIds.length > 0) {
    const notificationsCleared = {deletedIds: expireInviteNotificationIds};
    getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared});
  }
};

const publishJoinTeamNotifications = (teamId, teamName, user) => {
  const notificationsAdded = {
    notifications: [{
      type: JOIN_TEAM,
      teamId,
      teamName,
      preferredName: user.preferredName || user.email
    }]
  };
  getPubSub().publish(`${NOTIFICATIONS_ADDED}.${teamId}`, {notificationsAdded});
};

const acceptTeamInvite = async (teamId, authToken, email, subOptions = {}) => {
  const r = getRethink();
  const now = new Date();
  const {operationId} = subOptions;
  const userId = getUserId(authToken);
  const teamMemberId = toTeamMemberId(teamId, userId);
  const {team: {orgId, name: teamName}, user} = await r({
    team: r.table('Team').get(teamId).pluck('orgId', 'name'),
    user: r.table('User').get(userId)
  });
  const userOrgs = user.userOrgs || [];
  const userTeams = user.tms || [];
  const userInOrg = Boolean(userOrgs.find((org) => org.id === orgId));
  const tms = [...userTeams, teamId];
  const {expiredEmailInvitations, expireInviteNotificationIds, teamMember} = await r({
    // add the team to the user doc
    userUpdate: addUserToTMSUserOrg(userId, teamId, orgId),
    teamMember: insertNewTeamMember(userId, teamId),
    // find all possible emails linked to this person and mark them as accepted
    expiredEmailInvitations: r.table('Invitation')
      .getAll(email, {index: 'email'})
      .update({
        acceptedAt: now,
        // flag the token as expired so they cannot reuse the token
        tokenExpiration: new Date(0),
        updatedAt: now
      }, {returnChanges: true})('changes')('new_val').default([]),
    expireInviteNotificationIds: getTeamInviteNotifications(orgId, teamId, [email])
      .delete({returnChanges: true})('changes')('old_val')('id')
      .default([])
  });

  if (!userInOrg) {
    await adjustUserCount(userId, orgId, ADD_USER);
  }
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});

  publishRemovedInvitations(expiredEmailInvitations, operationId);
  publishClearNotifications(expireInviteNotificationIds, userId);
  publishJoinTeamNotifications(teamId, teamName, user);

  getPubSub().publish(`${TEAM_MEMBER}.${teamId}`, {teamMember: {teamMemberId, type: ADDED}, ...subOptions});

  // Send the new team member a welcome & a new token
  const newAuthToken = tmsSignToken(authToken, tms);
  const addedToTeam = {
    // no ID to rule out permanent notification. they already know, they are the ones who did it!
    startAt: now,
    type: ADD_TO_TEAM,
    teamId
  };
  const teamAdded = {
    notification: addedToTeam,
    teamId,
    teamMemberId
  };
  getPubSub().publish(`${TEAM_ADDED}.${userId}`, {teamAdded, ...subOptions});
  getPubSub().publish(`${NEW_AUTH_TOKEN}.${userId}`, {newAuthToken});

  return {
    authToken: newAuthToken,
    teamId,
    teamMemberId
  };
};

export default acceptTeamInvite;
