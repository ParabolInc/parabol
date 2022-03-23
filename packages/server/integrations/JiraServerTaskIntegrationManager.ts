import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import {CreateTaskResponse} from './AbstractTaskIntegrationManager'
import JiraServerRestManager from './jiraServer/JiraServerRestManager'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {IntegrationProviderJiraServer} from '../postgres/queries/getIntegrationProvidersByIds'
import splitDraftContent from '~/utils/draftjs/splitDraftContent'
import {ExternalLinks} from '~/types/constEnums'
import IntegrationRepoId from '~/shared/gqlIds/IntegrationRepoId'
import AbstractTaskIntegrationManager from './AbstractTaskIntegrationManager'

export default class JiraServerTaskIntegrationManager extends AbstractTaskIntegrationManager {
  public title = 'Jira Server'
  private readonly auth: IGetTeamMemberIntegrationAuthQueryResult
  private readonly provider: IntegrationProviderJiraServer

  constructor(
    auth: IGetTeamMemberIntegrationAuthQueryResult,
    provider: IntegrationProviderJiraServer
  ) {
    super()
    this.auth = auth
    this.provider = provider
  }

  private getManager() {
    const {serverBaseUrl, consumerKey, consumerSecret} = this.provider
    const {accessToken, accessTokenSecret} = this.auth
    return new JiraServerRestManager(
      serverBaseUrl!,
      consumerKey!,
      consumerSecret!,
      accessToken!,
      accessTokenSecret!
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

    const {repositoryId} = IntegrationRepoId.split(integrationRepoId)

    const res = await manager.createIssue(repositoryId, summary, description)

    if (res instanceof Error) {
      return res
    }
    const issueId = res.id

    return {
      integrationHash: JiraServerIssueId.join(this.provider.id, repositoryId, issueId),
      issueId,
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
    return `Created by ${creator} for ${assignee}
    See the dashboard of [${teamName}|${teamDashboardUrl}]
  
    *Powered by [Parabol|${ExternalLinks.INTEGRATIONS_JIRASERVER}]*`
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string
  ) {
    const comment = JiraServerTaskIntegrationManager.makeCreateJiraServerTaskComment(
      viewerName,
      assigneeName,
      teamName,
      teamDashboardUrl
    )
    const manager = this.getManager()
    return manager.addComment(comment, issueId)
  }
}
