import {MaybeReadonly} from '../../../client/types/generics'
import getPg from '../getPg'
import {getIntegrationProvidersQuery} from './generated/getIntegrationProvidersQuery'
import {
  IntegrationProvider,
  IntegrationProviderTypesEnum
} from '../types/IIntegrationProviderAndToken'

const getIntegrationProviders = async (
  type: MaybeReadonly<IntegrationProviderTypesEnum>,
  teamId: MaybeReadonly<string>,
  orgId: MaybeReadonly<string>
): Promise<IntegrationProvider[]> => {
  return getIntegrationProvidersQuery.run({type, teamId, orgId}, getPg())
}

export default getIntegrationProviders
