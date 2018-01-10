import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

const handleAddTeamMember = (teamMember, store) => {
  const {teamId} = fromTeamMemberId(teamMember.getValue('id'));
  const team = store.get(teamId);
  addNodeToArray(teamMember, team, 'teamMembers', 'checkInOrder', {storageKeyArgs: {sortBy: 'checkInOrder'}});
  addNodeToArray(teamMember, team, 'teamMembers', 'preferredName', {storageKeyArgs: {sortBy: 'preferredName'}});
};

const handleAddTeamMembers = pluralizeHandler(handleAddTeamMember);
export default handleAddTeamMembers;
