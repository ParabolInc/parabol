import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveInvitation = (invitationId, store, teamId) => {
  const invitation = store.get(invitationId);
  if (!invitation) return;
  const team = store.get(teamId);
  safeRemoveNodeFromArray(invitationId, team, 'invitations');
};

const handleRemoveInvitations = pluralizeHandler(handleRemoveInvitation);
export default handleRemoveInvitations;
