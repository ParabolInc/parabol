import {RemoveApprovedOrganizationDomainsSuccessResolvers} from '../resolverTypes'

export type RemoveApprovedOrganizationDomainsSuccessSource = {
  orgId: string
}

const RemoveApprovedOrganizationDomainsSuccess: RemoveApprovedOrganizationDomainsSuccessResolvers =
  {
    organization: async ({orgId}, _args, {dataLoader}) => {
      return dataLoader.get('organizations').loadNonNull(orgId)
    }
  }

export default RemoveApprovedOrganizationDomainsSuccess
