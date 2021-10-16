import {DataLoaderWorker} from '../graphql/graphql'
import {IntegrationProvider, IntegrationProvidersEnum} from '../types/IntegrationProviderAndTokenT'
import IntegrationProviderId, {
  IntegrationProviderIdT
} from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import IntegrationServerManager from './IntegrationServerManager'
import GitLabServerManager from './GitLabServerManager'

// TODO fix me

const taskIntegrationProviderClassMap: {
  [K in IntegrationProvidersEnum]: new (...args: any[]) => any
} = {
  GITLAB: GitLabServerManager
}

class MakeIntegrationServerManager {
  static async fromProviderId(
    id: IntegrationProviderIdT,
    dataLoader: DataLoaderWorker
  ): Promise<IntegrationServerManager> {
    const providerDbId = IntegrationProviderId.split(id)
    const provider = (await dataLoader
      .get('integrationProviders')
      .load(providerDbId)) as IntegrationProvider

    return new taskIntegrationProviderClassMap[provider.providerType](provider)
  }
}

export default MakeIntegrationServerManager
