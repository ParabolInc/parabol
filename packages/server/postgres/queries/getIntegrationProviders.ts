import {MaybeReadonly} from '../../../client/types/generics'
import getPg from '../getPg'
import {
  IntegrationProviderTypesEnum,
  getIntegrationProvidersQuery,
  IGetIntegrationProvidersQueryResult
} from './generated/getIntegrationProvidersQuery'

const getIntegrationProviders = async (
  type: MaybeReadonly<IntegrationProviderTypesEnum>,
  teamId: MaybeReadonly<string>,
  orgId: MaybeReadonly<string>
) => {
  return getIntegrationProvidersQuery.run({type, teamId, orgId}, getPg()) as Promise<
    IGetIntegrationProvidersQueryResult[]
  >
}

export default getIntegrationProviders
