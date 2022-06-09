import getPg from '../getPg'
import {updateUserEmailDomainsQuery} from './generated/updateUserEmailDomainsQuery'

const updateUserEmailDomainsToPG = async (oldDomain: string, newDomain: string) => {
  return updateUserEmailDomainsQuery.run({oldDomain, newDomain} as any, getPg())
}
export default updateUserEmailDomainsToPG
