import makeCreateJiraTaskComment from '../utils/makeCreateJiraTaskComment'
import JiraProjectId from '~/shared/gqlIds/JiraProjectId'
import createJiraTask from '../graphql/mutations/helpers/createJiraTask'
import JiraIssueId from '~/shared/gqlIds/JiraIssueId'
import {CreateTaskResponse, TaskIntegrationManager} from './TaskIntegrationManagerFactory'
import {AtlassianAuth} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'
import {Doc} from '../utils/convertContentStateToADF'

export default class JiraTaskIntegrationManager implements TaskIntegrationManager {
  public title = 'Jira'
  private readonly auth: AtlassianAuth

  constructor(auth: AtlassianAuth) {
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
    projectId,
    createdBySomeoneElseComment
  }: {
    rawContentStr: string
    projectId: string
    createdBySomeoneElseComment?: Doc
  }): Promise<CreateTaskResponse> {
    const {cloudId, projectKey} = JiraProjectId.split(projectId)

    const res = await createJiraTask(
      rawContentStr,
      cloudId,
      projectKey,
      this.auth,
      createdBySomeoneElseComment
    )

    if (res.error) {
      return {
        error: {
          message: res.error.message
        }
      }
    }

    const {issueKey} = res

    return {
      integrationHash: JiraIssueId.join(cloudId, issueKey),
      integration: {
        accessUserId: this.auth.userId,
        service: 'jira',
        cloudId,
        issueKey
      }
    }
  }
}
