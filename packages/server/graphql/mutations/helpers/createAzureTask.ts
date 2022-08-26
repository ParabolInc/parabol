import {DataLoaderWorker} from '../../../graphql/graphql'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../../../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {IntegrationProviderAzureDevOps} from '../../../postgres/queries/getIntegrationProvidersByIds'
import AzureDevOpsServerManager from '../../../utils/AzureDevOpsServerManager'

const createAzureTask = async (
  rawContentStr: string,
  serviceProjectHash: string,
  azureAuth: IGetTeamMemberIntegrationAuthQueryResult,
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
