import inviteTeamMembers from 'server/safeMutations/inviteTeamMembers';

const addTeamInvitees = async (invitees, teamId, viewerId) => {
  if (!invitees || invitees.length === 0) return {teamInviteNotifications: [], invitationIds: []};
  const {teamInviteNotifications, newInvitations} = await inviteTeamMembers(invitees, teamId, viewerId);
  const invitationIds = newInvitations.map(({id}) => id);
  return {teamInviteNotifications, invitationIds};
};

export default addTeamInvitees;
