import {MaybeReadonly} from '../../../client/types/generics'
import getPg from '../getPg'
import {getApprovedOrganizationDomainsQuery} from './generated/getApprovedOrganizationDomainsQuery'

const getApprovedOrganizationDomainsFromPG = async (orgIds: MaybeReadonly<string[]>) => {
  return getApprovedOrganizationDomainsQuery.run({orgIds} as any, getPg())
}
export default getApprovedOrganizationDomainsFromPG
