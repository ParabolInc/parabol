import {getUserId} from '../../../utils/authorization'
import {AddIntegrationProviderSuccessResolvers} from '../resolverTypes'

export type AddIntegrationProviderSuccessSource = {
  providerId: number
  orgId?: string
  teamId?: string
}

const AddIntegrationProviderSuccess: AddIntegrationProviderSuccessResolvers = {
  provider: async ({providerId}, _args, {dataLoader}) => {
    return dataLoader.get('integrationProviders').loadNonNull(providerId)
  },
  orgIntegrationProviders: ({orgId}) => {
    return orgId ? {orgId} : null
  },
  teamMemberIntegrations: async ({teamId}, _args, {authToken}) => {
    if (!teamId) return null
    const viewerId = getUserId(authToken)
    return {teamId, userId: viewerId}
  }
}

export default AddIntegrationProviderSuccess
