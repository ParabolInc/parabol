import {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {
  getSharedIntegrationProvidersQuery,
  IntegrationProviderServiceEnum
} from './generated/getSharedIntegrationProvidersQuery'
import {TIntegrationProvider} from './getIntegrationProvidersByIds'

const getSharedIntegrationProviders = async <T = TIntegrationProvider>(
  service: IntegrationProviderServiceEnum,
  orgTeamIds: MaybeReadonly<string[]>,
  teamIds: MaybeReadonly<string[]>
) => {
  const providers = await getSharedIntegrationProvidersQuery.run(
    {orgTeamIds, teamIds, service},
    getPg()
  )
  return providers as any as T[]
}

export default getSharedIntegrationProviders
