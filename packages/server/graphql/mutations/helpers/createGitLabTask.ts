import {JSONContent} from '@tiptap/core'
import {GraphQLResolveInfo} from 'graphql'
import {splitTipTapContent} from '../../../../client/shared/tiptap/splitTipTapContent'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'
import {TeamMemberIntegrationAuth} from '../../../postgres/types'
import {convertTipTapToMarkdown} from '../../../utils/convertTipTapToMarkdown'
import {DataLoaderWorker, GQLContext} from '../../graphql'

const createGitLabTask = async (
  rawContent: JSONContent,
  fullPath: string,
  gitlabAuth: TeamMemberIntegrationAuth,
  context: GQLContext,
  info: GraphQLResolveInfo,
  dataLoader: DataLoaderWorker
) => {
  const {accessToken, providerId} = gitlabAuth
  if (!accessToken) return {error: new Error('Invalid GitLab auth')}
  const {title, bodyContent} = splitTipTapContent(rawContent)
  const body = convertTipTapToMarkdown(bodyContent)
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
