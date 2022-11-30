import {stateToMarkdown} from 'draft-js-export-markdown'
import {GraphQLResolveInfo} from 'graphql'
import splitDraftContent from 'parabol-client/utils/draftjs/splitDraftContent'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../../../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {DataLoaderWorker, GQLContext} from '../../graphql'

const createGitLabTask = async (
  rawContent: string,
  fullPath: string,
  gitlabAuth: IGetTeamMemberIntegrationAuthQueryResult,
  context: GQLContext,
  info: GraphQLResolveInfo,
  dataLoader: DataLoaderWorker
) => {
  const {accessToken, providerId} = gitlabAuth
  if (!accessToken) return {error: new Error('Invalid GitLab auth')}
  const {title, contentState} = splitDraftContent(rawContent)
  const body = stateToMarkdown(contentState)
  const provider = await dataLoader.get('integrationProviders').load(providerId)
  const manager = new GitLabServerManager(gitlabAuth, context, info, provider!.serverBaseUrl!)
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
  return {gid: issue.id, providerId, fullPath}
}

export default createGitLabTask
