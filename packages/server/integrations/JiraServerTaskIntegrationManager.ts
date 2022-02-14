import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import {CreateTaskResponse, TaskIntegrationManager} from './TaskIntegrationManagerFactory'
import JiraServerRestManager from './jiraServer/JiraServerRestManager'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {TIntegrationProvider} from '../postgres/queries/getIntegrationProvidersByIds'
import splitDraftContent from '~/utils/draftjs/splitDraftContent'

export default class JiraServerTaskIntegrationManager implements TaskIntegrationManager {
  public title = 'Jira Server'
  private readonly auth: IGetTeamMemberIntegrationAuthQueryResult
  private readonly provider: TIntegrationProvider

  constructor(auth: IGetTeamMemberIntegrationAuthQueryResult, provider: TIntegrationProvider) {
    this.auth = auth
    this.provider = provider
  }

  async createTask({
    rawContentStr,
    integrationRepoId
  }: {
    rawContentStr: string
    integrationRepoId: string
  }): Promise<CreateTaskResponse> {
    const {serverBaseUrl, consumerKey, consumerSecret} = this.provider
    const {accessToken, accessTokenSecret} = this.auth
    if (!serverBaseUrl || !consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
      throw new Error('Provider is not configured')
    }
    const manager = new JiraServerRestManager(
      serverBaseUrl,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    )

    const {title: summary, contentState} = splitDraftContent(rawContentStr)
    // TODO: implement stateToJiraServerFormat
    const description = contentState.getPlainText()

    const res = await manager.createIssue(integrationRepoId, summary, description)

    if (res instanceof Error) {
      return res
    }
    const issueId = res.id
    const providerId = this.provider.id
    return {
      integrationHash: JiraServerIssueId.join(providerId, integrationRepoId, issueId),
      integration: {
        accessUserId: this.auth.userId,
        service: 'jiraServer',
        providerId: this.provider.id
      }
    }
  }
}
