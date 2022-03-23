import {GraphQLResolveInfo} from 'graphql'
import makeCreateGitHubTaskComment from '../utils/makeCreateGitHubTaskComment'
import createGitHubTask from '../graphql/mutations/helpers/createGitHubTask'
import GitHubRepoId from '../../client/shared/gqlIds/GitHubRepoId'
import GitHubIssueId from '../../client/shared/gqlIds/GitHubIssueId'
import {CreateTaskResponse} from './AbstractTaskIntegrationManager'
import {GitHubAuth} from '../postgres/queries/getGitHubAuthByUserIdTeamId'
import {GQLContext} from '../graphql/graphql'
import AbstractTaskIntegrationManager from './AbstractTaskIntegrationManager'
import getGitHubRequest from '../utils/getGitHubRequest'
import addComment from '../utils/githubQueries/addComment.graphql'
import {AddCommentMutation, AddCommentMutationVariables} from '../types/githubTypes'

export default class GitHubTaskIntegrationManager extends AbstractTaskIntegrationManager {
  public title = 'GitHub'
  private readonly auth: GitHubAuth

  constructor(auth: GitHubAuth) {
    super()
    this.auth = auth
  }

  getCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string
  ): string {
    return makeCreateGitHubTaskComment(viewerName, assigneeName, teamName, teamDashboardUrl)
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string,
    context: GQLContext,
    info: GraphQLResolveInfo
  ) {
    const comment = makeCreateGitHubTaskComment(
      viewerName,
      assigneeName,
      teamName,
      teamDashboardUrl
    )

    const {accessToken} = this.auth

    const githubRequest = getGitHubRequest(info, context, {
      accessToken
    })

    const [repoInfo, repoError] = await githubRequest<
      AddCommentMutation,
      AddCommentMutationVariables
    >(addComment, {
      input: {
        body: comment,
        subjectId: issueId
      }
    })

    if (repoError) {
      return repoError
    }

    return repoInfo
  }

  async createTask({
    rawContentStr,
    integrationRepoId,
    context,
    info
  }: {
    rawContentStr: string
    integrationRepoId: string
    context: GQLContext
    info: GraphQLResolveInfo
  }): Promise<CreateTaskResponse> {
    const {repoOwner, repoName} = GitHubRepoId.split(integrationRepoId)

    const res = await createGitHubTask(rawContentStr, repoOwner, repoName, this.auth, context, info)

    if (res.error) return res.error

    const {issueNumber, issueId} = res

    return {
      integrationHash: GitHubIssueId.join(integrationRepoId, issueNumber),
      issueId,
      integration: {
        accessUserId: this.auth.userId,
        service: 'github',
        issueNumber,
        nameWithOwner: integrationRepoId
      }
    }
  }
}
