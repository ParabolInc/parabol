import makeCreateJiraTaskComment from '../utils/makeCreateJiraTaskComment'
import JiraProjectId from '~/shared/gqlIds/JiraProjectId'
import createJiraTask from '../graphql/mutations/helpers/createJiraTask'
import makeAppURL from '~/utils/makeAppURL'
import appOrigin from '../appOrigin'
import JiraIssueId from '~/shared/gqlIds/JiraIssueId'
import BaseTaskIntegrationManager, {CreateTaskResponse} from './BaseTaskIntegrationManager'
import {AtlassianAuth} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'

export default class JiraTaskIntegrationManager extends BaseTaskIntegrationManager {
  public static title = 'Jira'
  public static segmentEventName = 'Published Task to Jira'
  public static authLoaderKey = 'freshAtlassianAuth' as const

  async createRemoteTaskAndUpdateDB(
    auth: AtlassianAuth,
    projectId: string,
    viewerName: string,
    assigneeName: string
  ): Promise<CreateTaskResponse> {
    const teamDashboardUrl = makeAppURL(appOrigin, `team/${this.teamId}`)

    const createdBySomeoneElseComment = this.createdBySomeoneElse
      ? makeCreateJiraTaskComment(viewerName, assigneeName, this.team.name, teamDashboardUrl)
      : undefined

    const {cloudId, projectKey} = JiraProjectId.split(projectId)

    const res = await createJiraTask(
      this.rawContentStr,
      cloudId,
      projectKey,
      auth,
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
      integrationData: {
        integrationHash: JiraIssueId.join(cloudId, issueKey),
        integration: {
          accessUserId: this.accessUserId!,
          service: 'jira',
          cloudId,
          issueKey
        }
      }
    }
  }
}
