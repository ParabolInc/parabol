import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import {CreateTaskResponse, TaskIntegrationManager} from './TaskIntegrationManagerFactory'
import JiraServerRestManager from './jiraServer/JiraServerRestManager'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {TIntegrationProvider} from '../postgres/queries/getIntegrationProvidersByIds'
import splitDraftContent from '~/utils/draftjs/splitDraftContent'
import {ExternalLinks} from '~/types/constEnums'
import IntegrationRepoId from '~/shared/gqlIds/IntegrationRepoId'

export default class JiraServerTaskIntegrationManager implements TaskIntegrationManager {
  public title = 'Jira Server'
  private readonly auth: IGetTeamMemberIntegrationAuthQueryResult
  private readonly provider: TIntegrationProvider

  constructor(auth: IGetTeamMemberIntegrationAuthQueryResult, provider: TIntegrationProvider) {
    this.auth = auth
    this.provider = provider
  }

  private getManager() {
    const {serverBaseUrl, consumerKey, consumerSecret} = this.provider
    const {accessToken, accessTokenSecret} = this.auth
    if (!serverBaseUrl || !consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
      throw new Error('Provider is not configured')
    }
    return new JiraServerRestManager(
      serverBaseUrl,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    )
  }

  async createTask({
    rawContentStr,
    integrationRepoId
  }: {
    rawContentStr: string
    integrationRepoId: string
  }): Promise<CreateTaskResponse> {
    const manager = this.getManager()

    const {title: summary, contentState} = splitDraftContent(rawContentStr)
    // TODO: implement stateToJiraServerFormat
    const description = contentState.getPlainText()

    const {repoId, providerId} = IntegrationRepoId.split(integrationRepoId)

    if (providerId !== this.provider.id || !repoId) {
      throw new Error('Incorrect IntegrationRepoId')
    }

    const res = await manager.createIssue(repoId, summary, description)

    if (res instanceof Error) {
      return res
    }
    const issueId = res.id

    return {
      integrationHash: JiraServerIssueId.join(this.provider.id, repoId, issueId),
      integration: {
        accessUserId: this.auth.userId,
        service: 'jiraServer',
        providerId: this.provider.id
      }
    }
  }

  async getIssue(issueId: string) {
    const manager = this.getManager()
    return manager.getIssue(issueId)
  }

  private static makeCreateJiraServerTaskComment(
    creator: string,
    assignee: string,
    teamName: string,
    teamDashboardUrl: string
  ) {
    const sanitizedCreator = creator.replace(/#(\d+)/g, '#​\u200b$1')
    const sanitizedAssignee = assignee.replace(/#(\d+)/g, '#​\u200b$1')

    return `Created by ${sanitizedCreator} for ${sanitizedAssignee}
    See the dashboard of [${teamName}|${teamDashboardUrl}]
  
    *Powered by [Parabol|${ExternalLinks.INTEGRATIONS_JIRASERVER}]*`
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    integrationHash: string
  ) {
    const {issueId} = JiraServerIssueId.split(integrationHash)
    const comment = JiraServerTaskIntegrationManager.makeCreateJiraServerTaskComment(
      viewerName,
      assigneeName,
      teamName,
      teamDashboardUrl
    )
    const manager = this.getManager()
    return manager.addComment(comment, issueId ?? '')
  }
}
