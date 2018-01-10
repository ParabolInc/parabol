import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveTeamMember = (teamMemberId, store) => {
  const teamMember = store.get(teamMemberId);
  if (!teamMember) return;
  const {teamId} = fromTeamMemberId(teamMemberId);
  const team = store.get(teamId);
  safeRemoveNodeFromArray(teamMemberId, team, 'teamMembers', {storageKeyArgs: {sortBy: 'checkInOrder'}});
  safeRemoveNodeFromArray(teamMemberId, team, 'teamMembers', {storageKeyArgs: {sortBy: 'preferredName'}});
};

const handleRemoveTeamMembers = pluralizeHandler(handleRemoveTeamMember);
export default handleRemoveTeamMembers;
