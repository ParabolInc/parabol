import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import addUserToTMSUserOrg from 'server/safeMutations/addUserToTMSUserOrg';
import insertNewTeamMember from 'server/safeMutations/insertNewTeamMember';
import getTeamInviteNotifications from 'server/safeQueries/getTeamInviteNotifications';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import {getUserId} from 'server/utils/authorization';
import publish from 'server/utils/publish';
import {ADD_USER} from 'server/utils/serverConstants';
import tmsSignToken from 'server/utils/tmsSignToken';
import {ADD_TO_TEAM, ADDED, JOIN_TEAM, NEW_AUTH_TOKEN, TEAM, TEAM_MEMBER, UPDATED} from 'universal/utils/constants';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';

const acceptTeamInvite = async (teamId, authToken, email, subOptions) => {
  const r = getRethink();
  const now = new Date();
  const userId = getUserId(authToken);
  const teamMemberId = toTeamMemberId(teamId, userId);
  const {team: {orgId}, user} = await r({
    team: r.table('Team').get(teamId),
    user: r.table('User').get(userId)
  });
  const userOrgs = user.userOrgs || [];
  const userTeams = user.tms || [];
  const userInOrg = Boolean(userOrgs.find((org) => org.id === orgId));
  const tms = [...userTeams, teamId];
  const {removedInvitationId, removedTeamInviteNotification} = await r({
    // add the team to the user doc
    userUpdate: addUserToTMSUserOrg(userId, teamId, orgId),
    teamMember: insertNewTeamMember(userId, teamId),
    // find all possible emails linked to this person and mark them as accepted
    removedInvitationId: r.table('Invitation')
      .getAll(email, {index: 'email'})
      .filter({teamId})
      .update({
        acceptedAt: now,
        // flag the token as expired so they cannot reuse the token
        tokenExpiration: new Date(0),
        updatedAt: now
      }, {returnChanges: true})('changes')(0)('new_val')('id').default(null),
    removedTeamInviteNotification: getTeamInviteNotifications(orgId, teamId, [email])
      .delete({returnChanges: true})('changes')(0)('old_val')
      .default(null)
  });

  if (!userInOrg) {
    await adjustUserCount(userId, orgId, ADD_USER);
  }

  // Send the new team member a welcome & a new token
  const newAuthToken = tmsSignToken(authToken, tms);
  publish(NEW_AUTH_TOKEN, userId, UPDATED, {tms});
  auth0ManagementClient.users.updateAppMetadata({id: userId}, {tms});

  // Tell the new team member about the team, welcome them, and remove their outstanding invitation notifications
  const notification = {type: ADD_TO_TEAM, teamId};
  publish(TEAM, userId, ADDED, {teamId, teamMemberId, notification, removedTeamInviteNotification}, subOptions);

  // Tell the rest of the team about the new team member, toast the event, and remove their old invitations
  const joinNotification = {
    type: JOIN_TEAM,
    teamId,
    teamMemberId
  };
  const data = {teamMemberId, notification: joinNotification, invitationId: removedInvitationId};
  publish(TEAM_MEMBER, teamId, ADDED, data, subOptions);

  return {
    newAuthToken,
    removedNotification: removedTeamInviteNotification
  };
};

export default acceptTeamInvite;
