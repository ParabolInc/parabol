import RepoAccess from '../platform/RepoAccess'
import type {RepoFetchCtx} from '../platform/ServerIntegrationDefinition'
import AzureDevOpsServerManager from './AzureDevOpsServerManager'

/** A client for the user's connection on this team, limited to the projects that connection shares with it. Null when there is no usable token */
const getAzureDevOpsManager = async ({dataLoader, teamId, userId}: RepoFetchCtx) => {
  const auth = await dataLoader.get('freshAzureDevOpsAuth').load({teamId, userId})
  if (!auth?.accessToken) return null
  const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
  if (provider.service !== 'azureDevOps') return null
  return new AzureDevOpsServerManager(auth, provider, RepoAccess.fromMeta(auth.meta))
}

export default getAzureDevOpsManager
