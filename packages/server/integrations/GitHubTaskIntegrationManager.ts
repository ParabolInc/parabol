import makeAppURL from '~/utils/makeAppURL'
import appOrigin from '../appOrigin'
import getRethink from '../database/rethinkDriver'
import makeCreateGitHubTaskComment from '../utils/makeCreateGitHubTaskComment'
import createGitHubTask from '../graphql/mutations/helpers/createGitHubTask'
import GitHubRepoId from '../../client/shared/gqlIds/GitHubRepoId'
import GitHubIssueId from '../../client/shared/gqlIds/GitHubIssueId'
import BaseTaskIntegrationManager from './BaseTaskIntegrationManager'

export default class GitHubTaskIntegrationManager extends BaseTaskIntegrationManager {
  public title = 'GitHub'
  public segmentEventName = 'Published Task to GitHub'

  getAuthLoader() {
    return this.dataLoader.get('githubAuth')
  }

  async createRemoteTaskAndUpdateDB(taskId, projectId) {
    const r = await getRethink()
    const now = new Date()

    const teamDashboardUrl = makeAppURL(appOrigin, `team/${this.teamId}`)

    const createdBySomeoneElseComment =
      this.userId && this.userId !== this.viewerId
        ? makeCreateGitHubTaskComment(
            this.viewerName,
            this.assigneeName,
            this.team.name,
            teamDashboardUrl
          )
        : undefined

    const {repoOwner, repoName} = GitHubRepoId.split(projectId)

    const res = await createGitHubTask(
      this.rawContentStr,
      repoOwner,
      repoName,
      this.auth,
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
