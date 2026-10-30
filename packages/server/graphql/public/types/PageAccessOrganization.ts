import type {PageAccessOrganizationResolvers} from '../resolverTypes'

const PageAccessOrganization: PageAccessOrganizationResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default PageAccessOrganization
