import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray';

const handleRemoveOrgApproval = (orgApprovalId, store) => {
  const orgApproval = store.get(orgApprovalId);
  if (!orgApproval) return;
  const teamId = orgApproval.getValue('teamId');
  const team = store.get(teamId);
  safeRemoveNodeFromArray(orgApprovalId, team, 'orgApprovals');
};

const handleRemoveOrgApprovals = pluralizeHandler(handleRemoveOrgApproval);
export default handleRemoveOrgApprovals;
