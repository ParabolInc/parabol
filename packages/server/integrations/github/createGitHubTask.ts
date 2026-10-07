import type {GraphQLResolveInfo} from 'graphql'
import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {tipTapToMarkdown} from 'parabol-client/shared/tiptap/tipTapToMarkdown'
import type {GQLContext} from '../../graphql/graphql'
import type {GitHubAuth} from '../../postgres/types'
import type {
  CreateIssueMutation,
  CreateIssueMutationVariables,
  GetRepoInfoQuery,
  GetRepoInfoQueryVariables
} from '../../types/githubTypes'
import getGitHubRequest from '../../utils/getGitHubRequest'
import createIssueMutation from '../../utils/githubQueries/createIssue.graphql'
import getRepoInfo from '../../utils/githubQueries/getRepoInfo.graphql'

const createGitHubTask = async (
  title: string,
  bodyContent: TipTapSerializedContent | null,
  repoOwner: string,
  repoName: string,
  githubAuth: GitHubAuth,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {accessToken, login} = githubAuth
  const body = bodyContent ? tipTapToMarkdown(bodyContent) : null
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

export default createGitHubTask
