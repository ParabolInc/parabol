import getPg from '../getPg'
import {updateUserEmailDomainsQuery} from './generated/updateUserEmailDomainsQuery'

const updateUserEmailDomainsToPG = async (newDomain: string, userIds: string[]) => {
  if (!userIds.length) return []
  return updateUserEmailDomainsQuery.run({newDomain, userIds}, getPg())
}
export default updateUserEmailDomainsToPG
