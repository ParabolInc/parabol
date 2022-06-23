import {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {getApprovedOrganizationDomainsByDomainsQuery} from './generated/getApprovedOrganizationDomainsByDomainsQuery'

const getApprovedOrganizationDomainsByDomainFromPG = async (domains: MaybeReadonly<string[]>) => {
  return getApprovedOrganizationDomainsByDomainsQuery.run({domains} as any, getPg())
}
export default getApprovedOrganizationDomainsByDomainFromPG
