import {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {
  getSharedIntegrationProvidersQuery,
  IntegrationProviderServiceEnum
} from './generated/getSharedIntegrationProvidersQuery'
import {TIntegrationProvider} from './getIntegrationProvidersByIds'

const getSharedIntegrationProviders = async <T = TIntegrationProvider>(
  service: IntegrationProviderServiceEnum,
  orgIds: MaybeReadonly<string[]>,
  teamIds: MaybeReadonly<string[]>
) => {
  const providers = await getSharedIntegrationProvidersQuery.run(
    // theres a bug where an empty teamIds array causes it to return no rows >:-()
    {orgIds, teamIds: [...teamIds, ''], service},
    getPg()
  )
  return providers as any as T[]
}

export default getSharedIntegrationProviders
