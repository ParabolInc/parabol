import {stateToMarkdown} from 'draft-js-export-markdown'
import {GraphQLResolveInfo} from 'graphql'
import splitDraftContent from 'parabol-client/utils/draftjs/splitDraftContent'
import {IntegrationProviderAzureDevOps} from 'server/postgres/queries/getIntegrationProvidersByIds'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../../../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import AzureDevOpsServerManager from '../../../utils/AzureDevOpsServerManager'
import {DataLoaderWorker, GQLContext} from '../../graphql'

const createAzureWorkItem = async (
  rawContent: string,
  fullPath: string,
  azureAuth: IGetTeamMemberIntegrationAuthQueryResult,
  context: GQLContext,
  info: GraphQLResolveInfo,
  dataLoader: DataLoaderWorker
) => {
  const {accessToken, providerId} = azureAuth
  if (!accessToken) return {error: new Error('Invalid GitLab auth')}
  const {title, contentState} = splitDraftContent(rawContent)
  const body = stateToMarkdown(contentState)
  const provider = (await dataLoader
    .get('integrationProviders')
    .load(providerId)) as IntegrationProviderAzureDevOps
  console.log('🚀 ~ azure prov', {provider})
  const manager = new AzureDevOpsServerManager(azureAuth, provider)
  const [createIssueData, createIssueError] = await manager.createIssue({
    title,
    description: body,
    projectPath: fullPath
  })

  if (createIssueError) {
    return {error: createIssueError}
  }
  const {createIssue} = createIssueData
  if (!createIssue) {
    return {error: new Error('GitLab create issue failed')}
  }
  const {issue} = createIssue
  if (!issue) {
    return {error: new Error('GitLab create issue failed')}
  }
  return {gid: issue.id, providerId}
}

export default createAzureWorkItem
