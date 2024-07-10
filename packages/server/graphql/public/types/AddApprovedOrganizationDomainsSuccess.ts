import {AddApprovedOrganizationDomainsSuccessResolvers} from '../resolverTypes'

export type AddApprovedOrganizationDomainsSuccessSource = {
  orgId: string
}

const AddApprovedOrganizationDomainsSuccess: AddApprovedOrganizationDomainsSuccessResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default AddApprovedOrganizationDomainsSuccess
