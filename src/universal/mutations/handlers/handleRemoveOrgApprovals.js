import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveOrgApproval = (orgApproval, store) => {
  if (!orgApproval) return;
  const teamId = orgApproval.getValue('teamId');
  const orgApprovalId = orgApproval.getValue('id');
  const team = store.get(teamId);
  safeRemoveNodeFromArray(orgApprovalId, team, 'orgApprovals');
};

const handleRemoveOrgApprovals = pluralizeHandler(handleRemoveOrgApproval);
export default handleRemoveOrgApprovals;
