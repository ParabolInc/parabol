import {MaybeReadonly} from '../../../client/types/generics'
import getPg from '../getPg'
import {
  IntegrationProvidersEnum,
  getIntegrationProvidersQuery,
  IGetIntegrationProvidersQueryResult
} from './generated/getIntegrationProvidersQuery'

const getIntegrationProviders = async (
  providerType: MaybeReadonly<IntegrationProvidersEnum>,
  teamId: MaybeReadonly<string>,
  orgId: MaybeReadonly<string>
) => {
  return getIntegrationProvidersQuery.run({providerType, teamId, orgId}, getPg()) as Promise<
    IGetIntegrationProvidersQueryResult[]
  >
}

export default getIntegrationProviders
