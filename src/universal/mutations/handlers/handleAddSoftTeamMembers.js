import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';
import getInProxy from 'universal/utils/relay/getInProxy';

const handleAddSoftTeamMember = (softTeamMember, store) => {
  if (!softTeamMember) return;
  const teamId = getInProxy(softTeamMember, 'teamId');
  const team = store.get(teamId);
  addNodeToArray(softTeamMember, team, 'softTeamMembers', 'preferredName');
};

const handleAddSoftTeamMembers = pluralizeHandler(handleAddSoftTeamMember);
export default handleAddSoftTeamMembers;
