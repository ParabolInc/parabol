import getPg from '../getPg'
import {getApprovedOrganizationDomainsQuery} from './generated/getApprovedOrganizationDomainsQuery'

const getApprovedOrganizationDomainsFromPG = async (orgId: string) => {
  return getApprovedOrganizationDomainsQuery.run({orgId} as any, getPg())
}
export default getApprovedOrganizationDomainsFromPG
