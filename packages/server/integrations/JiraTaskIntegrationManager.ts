import makeCreateJiraTaskComment from '../utils/makeCreateJiraTaskComment'
import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import createJiraTask from '../graphql/mutations/helpers/createJiraTask'
import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'
import {CreateTaskResponse} from './AbstractTaskIntegrationManager'
import {AtlassianAuth} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'
import AbstractTaskIntegrationManager from './AbstractTaskIntegrationManager'
import AtlassianServerManager from '../utils/AtlassianServerManager'

export default class JiraTaskIntegrationManager extends AbstractTaskIntegrationManager {
  public title = 'Jira'
  private readonly auth: AtlassianAuth

  constructor(auth: AtlassianAuth) {
    super()
    this.auth = auth
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string
  ) {
    const {cloudId, issueKey} = JiraIssueId.split(issueId)
    const {accessToken} = this.auth
    const comment = makeCreateJiraTaskComment(viewerName, assigneeName, teamName, teamDashboardUrl)
    const manager = new AtlassianServerManager(accessToken)
    return manager.addComment(cloudId, issueKey, comment)
  }

  async createTask({
    rawContentStr,
    integrationRepoId
  }: {
    rawContentStr: string
    integrationRepoId: string
  }): Promise<CreateTaskResponse> {
    const {cloudId, projectKey} = JiraProjectId.split(integrationRepoId)

    const res = await createJiraTask(rawContentStr, cloudId, projectKey, this.auth)

    if (res.error) return res.error

    const {issueKey} = res
    const integrationHash = JiraIssueId.join(cloudId, issueKey)

    return {
      integrationHash,
      issueId: integrationHash,
      integration: {
        accessUserId: this.auth.userId,
        service: 'jira',
        cloudId,
        issueKey,
        projectKey
      }
    }
  }
}
