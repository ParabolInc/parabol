import getOrgMembersConn from 'universal/mutations/connections/getOrgMembersConn'
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler'
import safeRemoveNodeFromConn from 'universal/utils/relay/safeRemoveNodeFromConn'

const handleRemoveOrgMember = (orgId, orgUserId, store) => {
  const orgUser = store.get(orgUserId)
  if (!orgUser) return
  const organization = store.get(orgId)
  const conn = getOrgMembersConn(organization)
  safeRemoveNodeFromConn(orgUserId, conn)
}

const handleRemoveOrgMembers = pluralizeHandler(handleRemoveOrgMember)
export default handleRemoveOrgMembers
