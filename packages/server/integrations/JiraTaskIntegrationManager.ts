import makeCreateJiraTaskComment from '../utils/makeCreateJiraTaskComment'
import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import createJiraTask from '../graphql/mutations/helpers/createJiraTask'
import JiraIssueId from 'parabol-client/shared/gqlIds/JiraIssueId'
import {CreateTaskResponse} from './AbstractTaskIntegrationManager'
import {AtlassianAuth} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'
import {Doc} from '../utils/convertContentStateToADF'
import AbstractTaskIntegrationManager from './AbstractTaskIntegrationManager'

export default class JiraTaskIntegrationManager extends AbstractTaskIntegrationManager {
  public title = 'Jira'
  private readonly auth: AtlassianAuth

  constructor(auth: AtlassianAuth) {
    super()
    this.auth = auth
  }

  getCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string
  ): Doc {
    return makeCreateJiraTaskComment(viewerName, assigneeName, teamName, teamDashboardUrl)
  }

  async createTask({
    rawContentStr,
    integrationRepoId,
    createdBySomeoneElseComment
  }: {
    rawContentStr: string
    integrationRepoId: string
    createdBySomeoneElseComment?: Doc
  }): Promise<CreateTaskResponse> {
    const {cloudId, projectKey} = JiraProjectId.split(integrationRepoId)

    const res = await createJiraTask(
      rawContentStr,
      cloudId,
      projectKey,
      this.auth,
      createdBySomeoneElseComment
    )

    if (res.error) return res.error

    const {issueKey} = res

    return {
      integrationHash: JiraIssueId.join(cloudId, issueKey),
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
