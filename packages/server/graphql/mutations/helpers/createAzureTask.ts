import {DataLoaderWorker} from '../../../graphql/graphql'
import {IntegrationProviderAzureDevOps} from '../../../postgres/queries/getIntegrationProvidersByIds'
import {TeamMemberIntegrationAuth} from '../../../postgres/types'
import AzureDevOpsServerManager from '../../../utils/AzureDevOpsServerManager'

const createAzureTask = async (
  rawContentStr: string,
  serviceProjectHash: string,
  azureAuth: TeamMemberIntegrationAuth,
  dataLoader: DataLoaderWorker
) => {
  const provider = await dataLoader.get('integrationProviders').loadNonNull(azureAuth.providerId)
  const manager = new AzureDevOpsServerManager(
    azureAuth,
    provider as IntegrationProviderAzureDevOps
  )

  return manager.createTask({rawContentStr, integrationRepoId: serviceProjectHash})
}

export default createAzureTask
