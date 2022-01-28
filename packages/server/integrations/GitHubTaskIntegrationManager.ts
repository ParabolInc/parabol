import makeCreateGitHubTaskComment from '../utils/makeCreateGitHubTaskComment'
import createGitHubTask from '../graphql/mutations/helpers/createGitHubTask'
import GitHubRepoId from '../../client/shared/gqlIds/GitHubRepoId'
import GitHubIssueId from '../../client/shared/gqlIds/GitHubIssueId'
import BaseTaskIntegrationManager, {CreateTaskResponse} from './BaseTaskIntegrationManager'
import {GitHubAuth} from '../postgres/queries/getGitHubAuthByUserIdTeamId'

export default class GitHubTaskIntegrationManager extends BaseTaskIntegrationManager {
  public static title = 'GitHub'
  public static segmentEventName = 'Published Task to GitHub'
  public static authLoaderKey = 'githubAuth' as const

  getCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string
  ): string {
    return makeCreateGitHubTaskComment(viewerName, assigneeName, teamName, teamDashboardUrl)
  }

  async createTask(
    auth: GitHubAuth,
    projectId: string,
    createdBySomeoneElseComment?: string
  ): Promise<CreateTaskResponse> {
    const {repoOwner, repoName} = GitHubRepoId.split(projectId)

    const res = await createGitHubTask(
      this.rawContentStr,
      repoOwner,
      repoName,
      auth,
      this.context,
      this.info,
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
          accessUserId: this.accessUserId!,
          service: 'github',
          issueNumber,
          nameWithOwner: projectId
        }
      }
    }
  }
}
