import getOrgMembersConn from 'universal/mutations/connections/getOrgMembersConn';
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler';
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn';
import toOrgMemberId from 'universal/utils/relay/toOrgMemberId';

const handleRemoveOrgMember = (orgId, userId, store) => {
  const orgMemberId = toOrgMemberId(orgId, userId);
  const orgMember = store.get(orgMemberId);
  if (!orgMember) return;
  const organization = store.get(orgId);
  const conn = getOrgMembersConn(organization);
  safeRemoveNodeFromConn(orgMemberId, conn);
};

const handleRemoveOrgMembers = pluralizeHandler(handleRemoveOrgMember);
export default handleRemoveOrgMembers;
