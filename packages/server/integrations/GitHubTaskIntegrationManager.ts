import makeAppURL from '~/utils/makeAppURL'
import appOrigin from '../appOrigin'
import getRethink from '../database/rethinkDriver'
import makeCreateGitHubTaskComment from '../utils/makeCreateGitHubTaskComment'
import createGitHubTask from '../graphql/mutations/helpers/createGitHubTask'
import GitHubRepoId from '../../client/shared/gqlIds/GitHubRepoId'
import GitHubIssueId from '../../client/shared/gqlIds/GitHubIssueId'
import BaseTaskIntegrationManager from './BaseTaskIntegrationManager'
import {GitHubAuth} from '../postgres/queries/getGitHubAuthByUserIdTeamId'

export default class GitHubTaskIntegrationManager extends BaseTaskIntegrationManager {
  public static title = 'GitHub'
  public static segmentEventName = 'Published Task to GitHub'
  public static authLoaderKey = 'githubAuth' as const

  async createRemoteTaskAndUpdateDB(
    auth: GitHubAuth,
    taskId: string,
    projectId: string,
    viewerName: string,
    assigneeName: string
  ) {
    const r = await getRethink()
    const now = new Date()

    const teamDashboardUrl = makeAppURL(appOrigin, `team/${this.teamId}`)

    const createdBySomeoneElseComment = this.createdBySomeoneElse
      ? makeCreateGitHubTaskComment(viewerName, assigneeName, this.team.name, teamDashboardUrl)
      : undefined

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
      return res
    }

    const {issueNumber} = res

    await r
      .table('Task')
      .get(taskId)
      .update({
        integrationHash: GitHubIssueId.join(projectId, issueNumber),
        integration: {
          accessUserId: this.accessUserId!,
          service: 'github',
          issueNumber,
          nameWithOwner: projectId
        },
        updatedAt: now
      })
      .run()

    return res
  }
}
