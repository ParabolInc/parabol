import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveInvitation = (invitation, store) => {
  if (!invitation) return;
  const teamId = invitation.getValue('teamId');
  const invitationId = invitation.getValue('id');
  const team = store.get(teamId);
  safeRemoveNodeFromArray(invitationId, team, 'invitations');
};

const handleRemoveInvitations = pluralizeHandler(handleRemoveInvitation);
export default handleRemoveInvitations;
