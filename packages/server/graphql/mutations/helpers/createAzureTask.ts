import type {JSONContent} from '@tiptap/core'
import type {DataLoaderWorker} from '../../../graphql/graphql'
import type {IntegrationProviderAzureDevOps} from '../../../postgres/queries/getIntegrationProvidersByIds'
import type {TeamMemberIntegrationAuth} from '../../../postgres/types'
import AzureDevOpsServerManager from '../../../utils/AzureDevOpsServerManager'

const createAzureTask = async (
  rawContentJSON: JSONContent,
  serviceProjectHash: string,
  azureAuth: TeamMemberIntegrationAuth,
  dataLoader: DataLoaderWorker
) => {
  const provider = await dataLoader.get('integrationProviders').loadNonNull(azureAuth.providerId)
  const manager = new AzureDevOpsServerManager(
    azureAuth,
    provider as IntegrationProviderAzureDevOps
  )

  return manager.createTask({
    rawContentJSON,
    integrationRepoId: serviceProjectHash
  })
}

export default createAzureTask
