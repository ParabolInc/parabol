import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import getPubSub from 'server/utils/getPubSub';
import {ADDED, INVITATION, NOTIFICATION} from 'universal/utils/constants';

const handleNewTeamInvitees = async (invitees, teamId, userId, subOptions) => {
  if (!invitees || invitees.length === 0) return [];
  const {teamInviteNotifications, newInvitations} = await inviteTeamMembers(invitees, teamId, userId);
  teamInviteNotifications.forEach((notification) => {
    const {id: notificationId, userIds} = notification;
    const invitedUserId = userIds[0];
    getPubSub().publish(`${NOTIFICATION}.${invitedUserId}`, {data: {notificationId, type: ADDED}, ...subOptions});
  });
  const invitationIds = newInvitations.map(({id}) => id);
  invitationIds.forEach((invitationId) => {
    getPubSub().publish(`${INVITATION}.${teamId}`, {data: {invitationId, type: ADDED}, ...subOptions});
  });
  return invitationIds;
};

export default handleNewTeamInvitees;
