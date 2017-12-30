import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';

const handleAddTeamMember = (newNode, store) => {
  const {teamId} = fromTeamMemberId(newNode.getValue('id'));
  const team = store.get(teamId);
  addNodeToArray(newNode, team, 'teamMembers', 'checkInOrder', {storageKeyArgs: {sortBy: 'checkInOrder'}});
  addNodeToArray(newNode, team, 'teamMembers', 'preferredName', {storageKeyArgs: {sortBy: 'preferredName'}});
};

const handleAddTeamMembers = pluralizeHandler(handleAddTeamMember);
export default handleAddTeamMembers;
