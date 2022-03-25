import {GraphQLResolveInfo} from 'graphql'
import makeCreateGitHubTaskComment from '../../utils/makeCreateGitHubTaskComment'
import createGitHubTask from '../../graphql/mutations/helpers/createGitHubTask'
import GitHubRepoId from '../../../client/shared/gqlIds/GitHubRepoId'
import GitHubIssueId from '../../../client/shared/gqlIds/GitHubIssueId'
import {GitHubAuth} from '../../postgres/queries/getGitHubAuthByUserIdTeamId'
import {GQLContext} from '../../graphql/graphql'
import getGitHubRequest from '../../utils/getGitHubRequest'
import addComment from '../../utils/githubQueries/addComment.graphql'
import {AddCommentMutation, AddCommentMutationVariables} from '../../types/githubTypes'
import {TaskIntegrationManager, CreateTaskResponse} from '../TaskIntegrationManagerFactory'

export default class GitHubServerManager implements TaskIntegrationManager {
  public title = 'GitHub'
  private readonly auth: GitHubAuth
  private readonly context: GQLContext
  private readonly info: GraphQLResolveInfo

  constructor(auth: GitHubAuth, context: GQLContext, info: GraphQLResolveInfo) {
    this.auth = auth
    this.context = context
    this.info = info
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string
  ): Promise<string | Error> {
    const comment = makeCreateGitHubTaskComment(
      viewerName,
      assigneeName,
      teamName,
      teamDashboardUrl
    )

    const {accessToken} = this.auth

    const githubRequest = getGitHubRequest(this.info, this.context, {
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

    return repoInfo.addComment!.subject!.id
  }

  async createTask({
    rawContentStr,
    integrationRepoId
  }: {
    rawContentStr: string
    integrationRepoId: string
  }): Promise<CreateTaskResponse> {
    const {repoOwner, repoName} = GitHubRepoId.split(integrationRepoId)

    const res = await createGitHubTask(
      rawContentStr,
      repoOwner,
      repoName,
      this.auth,
      this.context,
      this.info
    )

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
