import {RecordSourceSelectorProxy} from 'relay-runtime'
import safeRemoveNodeFromConn from '../../utils/relay/safeRemoveNodeFromConn'
import getOrgMembersConn from '../connections/getOrgMembersConn'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveOrgMember = (
  orgId: string,
  orgUserId: string | null,
  store: RecordSourceSelectorProxy
) => {
  if (!orgUserId) return
  const orgUser = store.get(orgUserId)
  if (!orgUser) return
  const organization = store.get(orgId)
  const conn = getOrgMembersConn(organization)
  safeRemoveNodeFromConn(orgUserId, conn)
}

const handleRemoveOrgMembers = pluralizeHandler(handleRemoveOrgMember)
export default handleRemoveOrgMembers
