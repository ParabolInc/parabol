import type {AddApprovedOrganizationDomainsPayloadResolvers} from '../resolverTypes'

export type AddApprovedOrganizationDomainsPayloadSource = {
  orgId: string
}

const AddApprovedOrganizationDomainsPayload: AddApprovedOrganizationDomainsPayloadResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default AddApprovedOrganizationDomainsPayload
