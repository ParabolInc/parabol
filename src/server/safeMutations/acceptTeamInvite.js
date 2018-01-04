import adjustUserCount from 'server/billing/helpers/adjustUserCount';
import getRethink from 'server/database/rethinkDriver';
import addUserToTMSUserOrg from 'server/safeMutations/addUserToTMSUserOrg';
import insertNewTeamMember from 'server/safeMutations/insertNewTeamMember';
import getTeamInviteNotifications from 'server/safeQueries/getTeamInviteNotifications';
import {getUserId} from 'server/utils/authorization';
import {ADD_USER} from 'server/utils/serverConstants';

const acceptTeamInvite = async (teamId, authToken, email) => {
  const r = getRethink();
  const now = new Date();
  const userId = getUserId(authToken);
  const {team: {orgId}, user} = await r({
    team: r.table('Team').get(teamId),
    user: r.table('User').get(userId)
  });
  const userOrgs = user.userOrgs || [];
  const userInOrg = Boolean(userOrgs.find((org) => org.id === orgId));
  const {removedInvitationId, removedNotification} = await r({
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
    removedNotification: getTeamInviteNotifications(orgId, teamId, [email])
      .delete({returnChanges: true})('changes')(0)('old_val')
      .default(null)
  });

  if (!userInOrg) {
    await adjustUserCount(userId, orgId, ADD_USER);
  }

  return {
    removedNotification,
    removedInvitationId
  };
};

export default acceptTeamInvite;
