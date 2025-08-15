import type {PageAccessOrganizationResolvers} from '../resolverTypes'

const PageAccessOrganization: PageAccessOrganizationResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    const organization = await dataLoader.get('organizations').loadNonNull(orgId)
    return {
      ...organization,
      id: `preview:${organization.id}`
    }
  }
}

export default PageAccessOrganization
