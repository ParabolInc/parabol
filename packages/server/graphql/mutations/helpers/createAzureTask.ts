import {stateToMarkdown} from 'draft-js-export-markdown'
import {GraphQLResolveInfo} from 'graphql'
import splitDraftContent from '../../../../client/utils/draftjs/splitDraftContent'
import {
  CreateIssueMutation,
  CreateIssueMutationVariables,
  GetRepoInfoQuery,
  GetRepoInfoQueryVariables
} from '../../../types/githubTypes'
import getGitHubRequest from '../../../utils/getGitHubRequest'
import createIssueMutation from '../../../utils/githubQueries/createIssue.graphql'
import getRepoInfo from '../../../utils/githubQueries/getRepoInfo.graphql'
import {GQLContext} from '../../graphql'

const createAzureTask = async (
  rawContent: string,
  repoOwner: string,
  repoName: string,
  azureAuth: any, // AzureAuth,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {accessToken, login} = azureAuth
  const {title, contentState} = splitDraftContent(rawContent)
  const body = stateToMarkdown(contentState) as string
  const githubRequest = getGitHubRequest(info, context, {
    accessToken
  })
  const [repoInfo, repoError] = await githubRequest<GetRepoInfoQuery, GetRepoInfoQueryVariables>(
    getRepoInfo,
    {
      assigneeLogin: login,
      repoName,
      repoOwner
    }
  )
  if (repoError) {
    return {error: repoError}
  }

  const {repository, user} = repoInfo
  if (!repository || !user) {
    return {
      error: new Error('GitHub repo/user not found')
    }
  }

  const {id: repositoryId} = repository
  const {id: ghAssigneeId} = user
  const [createIssueData, createIssueError] = await githubRequest<
    CreateIssueMutation,
    CreateIssueMutationVariables
  >(createIssueMutation, {
    input: {
      title,
      body,
      repositoryId,
      assigneeIds: [ghAssigneeId]
    }
  })
  if (createIssueError) {
    return {error: createIssueError}
  }

  const {createIssue} = createIssueData
  if (!createIssue) {
    return {error: new Error('GitHub create issue failed')}
  }
  const {issue} = createIssue
  if (!issue) {
    return {error: new Error('GitHub create issue failed')}
  }

  const {number: issueNumber, id: issueId} = issue

  return {issueNumber, issueId}
}

export default createAzureTask
