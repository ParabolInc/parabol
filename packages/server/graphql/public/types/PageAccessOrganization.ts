import {PageAccessOrganizationResolvers} from '../resolverTypes'

const PageAccessOrganization: PageAccessOrganizationResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(orgId)
  }
}

export default PageAccessOrganization
