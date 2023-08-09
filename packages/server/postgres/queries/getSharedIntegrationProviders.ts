import {MaybeReadonly} from 'parabol-client/types/generics'
import getPg from '../getPg'
import {
  getSharedIntegrationProvidersQuery,
  IGetSharedIntegrationProvidersQueryResult,
  IntegrationProviderServiceEnum
} from './generated/getSharedIntegrationProvidersQuery'

const getSharedIntegrationProviders = async <T = IGetSharedIntegrationProvidersQueryResult>(
  service: IntegrationProviderServiceEnum,
  orgTeamIds: MaybeReadonly<string[]>,
  teamIds: MaybeReadonly<string[]>
) => {
  const providers = await getSharedIntegrationProvidersQuery.run(
    // theres a bug where an empty teamIds array causes it to return no rows >:-()
    {orgTeamIds, teamIds: [...teamIds, ''], service},
    getPg()
  )
  return providers as any as T[]
}

export default getSharedIntegrationProviders
