import {DataLoaderWorker} from '../graphql/graphql'
import {
  IntegrationProvider,
  IntegrationProviderTypesEnum
} from '../types/IntegrationProviderAndTokenT'
import IntegrationProviderId, {
  IntegrationProviderIdT
} from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import IntegrationServerManager from './IntegrationServerManager'
import GitLabServerManager from './GitLabServerManager'

// TODO fix me

const taskIntegrationProviderClassMap: {
  [K in IntegrationProviderTypesEnum]: new (...args: any[]) => any
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

    return new taskIntegrationProviderClassMap[provider.type](provider)
  }
}

export default MakeIntegrationServerManager
