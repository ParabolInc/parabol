import {DataLoaderWorker} from '../graphql/graphql'
import {
  IntegrationProvider,
  IntegrationProviderTypesEnum
} from '../postgres/types/IIntegrationProviderAndToken'
import IntegrationProviderId, {
  IntegrationProviderIdT
} from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import IntegrationServerManager from './IntegrationServerManager'
import GitLabServerManager from './GitLabServerManager'

// TODO: make Mattermost fit this pattern!

const taskIntegrationProviderClassMap: {
  [K in Exclude<IntegrationProviderTypesEnum, 'mattermost'>]: new (...args: any[]) => any
} = {
  gitlab: GitLabServerManager
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
