import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveOrgApproval = (newNode, store) => {
  const orgApproval = store.get(newNode);
  const teamId = orgApproval.getValue('teamId');
  const team = store.get(teamId);
  safeRemoveNodeFromArray(newNode, team, 'orgApprovals');
};

const handleRemoveOrgApprovals = pluralizeHandler(handleRemoveOrgApproval);
export default handleRemoveOrgApprovals;
