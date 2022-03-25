import {stateToMarkdown} from 'draft-js-export-markdown'
import {GraphQLResolveInfo} from 'graphql'
import splitDraftContent from 'parabol-client/utils/draftjs/splitDraftContent'
import createIssueMutation from '../../nestedSchema/GitLab/mutations/createIssue.graphql'
import {DataLoaderWorker, GQLContext} from '../../graphql'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../../../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {CreateIssueMutation} from '../../../types/gitlabTypes'

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
  if (!provider?.serverBaseUrl) return {error: new Error('serverBaseUrl not found')}
  const manager = new GitLabServerManager(accessToken, provider.serverBaseUrl)
  const gitlabRequest = manager.getGitLabRequest(info, context)
  const [createIssueData, createIssueError] = await gitlabRequest<CreateIssueMutation>(
    createIssueMutation,
    {
      input: {
        title,
        description: body,
        projectPath: fullPath
      }
    }
  )
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

export default createGitLabTask
