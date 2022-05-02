import {OrganizationResolvers} from '../resolverTypes'

const Organization: OrganizationResolvers = {
  approvedDomains: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizationApprovedDomains').load(orgId)
  }
}

export default Organization
