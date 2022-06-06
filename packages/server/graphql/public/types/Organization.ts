import {isSuperUser} from '../../../utils/authorization'
import {OrganizationResolvers} from '../resolverTypes'

const Organization: OrganizationResolvers = {
  approvedDomains: async ({id: orgId}) => {
    return dataLoader.get('organizationApprovedDomainsByOrgId').load(orgId)
  },
  company: async ({activeDomain}, _args, {authToken}) => {
    if (!activeDomain || !isSuperUser(authToken)) return null
    return {id: activeDomain}
  }
}

export default Organization
