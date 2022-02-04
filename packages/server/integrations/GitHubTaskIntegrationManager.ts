import {GraphQLResolveInfo} from 'graphql'
import makeCreateGitHubTaskComment from '../utils/makeCreateGitHubTaskComment'
import createGitHubTask from '../graphql/mutations/helpers/createGitHubTask'
import GitHubRepoId from '../../client/shared/gqlIds/GitHubRepoId'
import GitHubIssueId from '../../client/shared/gqlIds/GitHubIssueId'
import {CreateTaskResponse, TaskIntegrationManager} from './TaskIntegrationManagerFactory'
import {GitHubAuth} from '../postgres/queries/getGitHubAuthByUserIdTeamId'
import {GQLContext} from '../graphql/graphql'

export default class GitHubTaskIntegrationManager implements TaskIntegrationManager {
  public title = 'GitHub'
  private readonly auth: GitHubAuth

  constructor(auth: GitHubAuth) {
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
    accessUserId,
    rawContentStr,
    projectId,
    createdBySomeoneElseComment,
    context,
    info
  }: {
    accessUserId: string
    rawContentStr: string
    projectId: string
    createdBySomeoneElseComment?: string
    context: GQLContext
    info: GraphQLResolveInfo
  }): Promise<CreateTaskResponse> {
    const {repoOwner, repoName} = GitHubRepoId.split(projectId)

    const res = await createGitHubTask(
      rawContentStr,
      repoOwner,
      repoName,
      this.auth,
      context,
      info,
      createdBySomeoneElseComment
    )

    if (res.error) {
      return {
        error: res.error
      }
    }

    const {issueNumber} = res

    return {
      integrationData: {
        integrationHash: GitHubIssueId.join(projectId, issueNumber),
        integration: {
          accessUserId,
          service: 'github',
          issueNumber,
          nameWithOwner: projectId
        }
      }
    }
  }
}
