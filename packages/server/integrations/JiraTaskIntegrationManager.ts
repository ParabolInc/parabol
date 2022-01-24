import DataLoader from 'dataloader'
import makeCreateJiraTaskComment from '../utils/makeCreateJiraTaskComment'
import JiraProjectId from '~/shared/gqlIds/JiraProjectId'
import createJiraTask from '../graphql/mutations/helpers/createJiraTask'
import makeAppURL from '~/utils/makeAppURL'
import appOrigin from '../appOrigin'
import JiraIssueId from '~/shared/gqlIds/JiraIssueId'
import getRethink from '../database/rethinkDriver'
import BaseTaskIntegrationManager from './BaseTaskIntegrationManager'
import {AtlassianAuth} from '../postgres/queries/getAtlassianAuthByUserIdTeamId'

type TeamUserKey = {
  teamId: string
  userId: string
}

export default class JiraTaskIntegrationManager extends BaseTaskIntegrationManager {
  public title = 'Jira'
  public segmentEventName = 'Published Task to Jira'

  getAuthLoader(): DataLoader<TeamUserKey, AtlassianAuth | null, string> {
    return this.dataLoader.get('freshAtlassianAuth')
  }

  async createRemoteTaskAndUpdateDB(taskId, projectId) {
    const r = await getRethink()
    const now = new Date()

    const teamDashboardUrl = makeAppURL(appOrigin, `team/${this.teamId}`)

    const createdBySomeoneElseComment =
      this.viewerId !== this.userId
        ? makeCreateJiraTaskComment(
            this.viewerName,
            this.assigneeName,
            this.team.name,
            teamDashboardUrl
          )
        : undefined

    const {cloudId, projectKey} = JiraProjectId.split(projectId)

    const res = await createJiraTask(
      this.rawContentStr,
      cloudId,
      projectKey,
      this.auth,
      createdBySomeoneElseComment
    )

    if (res.error) {
      return res
    }

    const {issueKey} = res

    await r
      .table('Task')
      .get(taskId)
      .update({
        integrationHash: JiraIssueId.join(cloudId, issueKey),
        integration: {
          accessUserId: this.accessUserId!,
          service: 'jira',
          cloudId,
          issueKey
        },
        updatedAt: now
      })
      .run()

    return res
  }
}
