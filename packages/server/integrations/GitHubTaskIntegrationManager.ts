import {GraphQLResolveInfo} from 'graphql'
import makeCreateGitHubTaskComment from '../utils/makeCreateGitHubTaskComment'
import createGitHubTask from '../graphql/mutations/helpers/createGitHubTask'
import GitHubRepoId from '../../client/shared/gqlIds/GitHubRepoId'
import GitHubIssueId from '../../client/shared/gqlIds/GitHubIssueId'
import {CreateTaskResponse} from './AbstractTaskIntegrationManager'
import {GitHubAuth} from '../postgres/queries/getGitHubAuthByUserIdTeamId'
import {GQLContext} from '../graphql/graphql'
import AbstractTaskIntegrationManager from './AbstractTaskIntegrationManager'

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

  async createTask({
    rawContentStr,
    integrationRepoId,
    createdBySomeoneElseComment,
    context,
    info
  }: {
    rawContentStr: string
    integrationRepoId: string
    createdBySomeoneElseComment?: string
    context: GQLContext
    info: GraphQLResolveInfo
  }): Promise<CreateTaskResponse> {
    const {repoOwner, repoName} = GitHubRepoId.split(integrationRepoId)

    const res = await createGitHubTask(
      rawContentStr,
      repoOwner,
      repoName,
      this.auth,
      context,
      info,
      createdBySomeoneElseComment
    )

    if (res.error) return res.error

    const {issueNumber} = res

    return {
      integrationHash: GitHubIssueId.join(integrationRepoId, issueNumber),
      integration: {
        accessUserId: this.auth.userId,
        service: 'github',
        issueNumber,
        nameWithOwner: integrationRepoId
      }
    }
  }
}
