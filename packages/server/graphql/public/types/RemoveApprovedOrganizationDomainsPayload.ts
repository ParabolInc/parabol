import type {RemoveApprovedOrganizationDomainsPayloadResolvers} from '../resolverTypes'

export type RemoveApprovedOrganizationDomainsPayloadSource = {
  orgId: string
}

const RemoveApprovedOrganizationDomainsPayload: RemoveApprovedOrganizationDomainsPayloadResolvers =
  {
    organization: async ({orgId}, _args, {dataLoader}) => {
      return dataLoader.get('organizations').loadNonNull(orgId)
    }
  }

export default RemoveApprovedOrganizationDomainsPayload
