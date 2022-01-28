import makeCreateJiraTaskComment from '../utils/makeCreateJiraTaskComment'
import JiraProjectId from '~/shared/gqlIds/JiraProjectId'
import createJiraTask from '../graphql/mutations/helpers/createJiraTask'
import JiraIssueId from '~/shared/gqlIds/JiraIssueId'
import BaseTaskIntegrationManager, {CreateTaskResponse} from './BaseTaskIntegrationManager'
import {AtlassianAuth} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'
import {Doc} from '../utils/convertContentStateToADF'

export default class JiraTaskIntegrationManager extends BaseTaskIntegrationManager {
  public static title = 'Jira'
  public static segmentEventName = 'Published Task to Jira'
  public static authLoaderKey = 'freshAtlassianAuth' as const

  getCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string
  ): Doc {
    return makeCreateJiraTaskComment(viewerName, assigneeName, teamName, teamDashboardUrl)
  }

  async createTask({
    auth,
    accessUserId,
    rawContentStr,
    projectId,
    createdBySomeoneElseComment
  }: {
    auth: AtlassianAuth
    accessUserId: string
    rawContentStr: string
    projectId: string
    createdBySomeoneElseComment?: Doc
  }): Promise<CreateTaskResponse> {
    const {cloudId, projectKey} = JiraProjectId.split(projectId)

    const res = await createJiraTask(
      rawContentStr,
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
          accessUserId,
          service: 'jira',
          cloudId,
          issueKey
        }
      }
    }
  }
}
