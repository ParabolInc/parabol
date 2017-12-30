import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import addNodeToArray from 'universal/utils/relay/addNodeToArray';

const handleAddOrgApproval = (newNode, store) => {
  const teamId = newNode.getValue('teamId');
  const team = store.get(teamId);
  addNodeToArray(newNode, team, 'orgApprovals', 'email');
};

const handleAddOrgApprovals = pluralizeHandler(handleAddOrgApproval);
export default handleAddOrgApprovals;
