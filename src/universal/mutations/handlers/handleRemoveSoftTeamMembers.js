import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveSoftTeamMember = (softTeamMember, store) => {
  if (!softTeamMember) return;
  const softTeamMemberId = softTeamMember.getValue('id');
  const softTeamMemberProxy = store.get(softTeamMemberId);
  if (!softTeamMemberProxy) return;
  const teamId = softTeamMember.getValue('teamId');
  const team = store.get(teamId);
  safeRemoveNodeFromArray(softTeamMemberId, team, 'softTeamMembers');
};

const handleRemoveSoftTeamMembers = pluralizeHandler(handleRemoveSoftTeamMember);
export default handleRemoveSoftTeamMembers;
