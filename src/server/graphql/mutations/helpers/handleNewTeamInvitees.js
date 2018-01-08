import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';
import publish from 'server/utils/publish';
import {ADDED, INVITATION, NOTIFICATION} from 'universal/utils/constants';

const handleNewTeamInvitees = async (invitees, teamId, userId, subOptions) => {
  if (!invitees || invitees.length === 0) return [];
  const {teamInviteNotifications, newInvitations} = await inviteTeamMembers(invitees, teamId, userId);
  teamInviteNotifications.forEach((notification) => {
    const {id: notificationId, userIds} = notification;
    const invitedUserId = userIds[0];
    publish(NOTIFICATION, invitedUserId, ADDED, {notificationId}, subOptions);
  });
  const invitationIds = newInvitations.map(({id}) => id);
  invitationIds.forEach((invitationId) => {
    publish(INVITATION, teamId, ADDED, {invitationId}, subOptions);
  });
  return invitationIds;
};

export default handleNewTeamInvitees;
