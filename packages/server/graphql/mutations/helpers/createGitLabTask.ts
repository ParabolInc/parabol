import {stateToMarkdown} from 'draft-js-export-markdown'
import {GraphQLResolveInfo} from 'graphql'
import splitDraftContent from 'parabol-client/utils/draftjs/splitDraftContent'
// import {
//   AddCommentMutation,
//   AddCommentMutationVariables,
//   CreateIssueMutation,
//   CreateIssueMutationVariables,
//   GetRepoInfoQuery,
//   GetRepoInfoQueryVariables
// } from '../../../types/gitlabTypes'
import createIssueMutation from '../../../utils/gitlabQueries/createIssue.graphql'
// import addComment from '../../../utils/gitlabQueries/addComment.graphql'
// import getRepoInfo from '../../../utils/gitlabQueries/getRepoInfo.graphql'
import {DataLoaderWorker, GQLContext} from '../../graphql'
import getGitLabRequest from '../../../utils/getGitLabRequest'
import GitLabServerManager from '../../../integrations/gitlab/GitLabServerManager'

const createGitLabTask = async (
  rawContent: string,
  fullPath: string,
  gitlabAuth: any, // TODO: GitLabAuth
  context: GQLContext,
  info: GraphQLResolveInfo,
  dataLoader: DataLoaderWorker,
  comment?: string
) => {
  const {accessToken, login, providerId} = gitlabAuth
  const {title, contentState} = splitDraftContent(rawContent)
  const body = stateToMarkdown(contentState)
  const provider = await dataLoader.get('integrationProviders').load(providerId)
  const manager = new GitLabServerManager(accessToken, provider?.serverBaseUrl)
  const gitlabRequest = manager.getGitLabRequest(info, context)
  const [createIssueData, createIssueError] = await gitlabRequest(createIssueMutation, {
    input: {
      title,
      description: body,
      projectPath: fullPath
    }
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

  const {iid, id, webPath} = issue
  // if (comment) {
  //   // await gitlabRequest<AddCommentMutation, AddCommentMutationVariables>(addComment, {
  //   await gitlabRequest(addComment, {
  //     input: {
  //       body: comment,
  //       subjectId: id
  //     }
  //   })
  // }
  return {issueNumber: iid, gid: id, webPath, providerId}
}

export default createGitLabTask
