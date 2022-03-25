import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {IntegrationProviderJiraServer} from '../../postgres/queries/getIntegrationProvidersByIds'
import {CreateTaskResponse, TaskIntegrationManager} from '../TaskIntegrationManagerFactory'
import splitDraftContent from '~/utils/draftjs/splitDraftContent'
import IntegrationRepoId from '~/shared/gqlIds/IntegrationRepoId'
import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import {ExternalLinks} from '~/types/constEnums'

export interface JiraServerRestProject {
  /// more available fields
  expand: string
  /// project url
  self: string
  id: string
  key: string
  name: string
  avatarUrls: {
    '48x48': string
    '24x24': string
    '16x16': string
    '32x32': string
  }
  /// 'software'
  projectTypeKey: string
  archived: boolean
}

interface JiraServerCreateMeta {
  projects: {
    id: string
    issuetypes: {
      name: string
      id: string
    }[]
  }[]
}

interface JiraServerCreateIssueResponse {
  id: string
  key: string
  self: string
}

interface JiraServerAddCommentResponse {
  id: string
}

export interface JiraServerIssue {
  id: string
  key: string
  self: string
  fields: {
    summary: string
    description: string | null
    project: {
      key: string
    }
  }
  renderedFields: {
    description: string
  }
}

export default class JiraServerRestManager implements TaskIntegrationManager {
  public title = 'Jira Server'
  private readonly auth: IGetTeamMemberIntegrationAuthQueryResult
  private readonly provider: IntegrationProviderJiraServer
  private readonly serverBaseUrl: string
  private readonly oauth: OAuth
  private readonly token: OAuth.Token

  constructor(
    auth: IGetTeamMemberIntegrationAuthQueryResult,
    provider: IntegrationProviderJiraServer
  ) {
    this.auth = auth
    this.provider = provider

    const {serverBaseUrl, consumerKey, consumerSecret} = this.provider
    const {accessToken, accessTokenSecret} = this.auth

    this.serverBaseUrl = serverBaseUrl

    this.oauth = new OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret
      },
      signature_method: 'RSA-SHA1',
      // bind consumerSecret instead of using key parameter because it gets URL formatted which breaks the private key
      hash_function: (baseString) =>
        crypto.createSign('RSA-SHA1').update(baseString).sign(consumerSecret).toString('base64')
    })
    this.token = {
      key: accessToken!,
      secret: accessTokenSecret!
    }
  }

  formatError(json: any) {
    // we might want to read `error` property as well in case this message is not enough
    return json.errorMessages?.join('\n')
  }

  async parseJsonResponse<T>(response: Response): Promise<T | Error> {
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return new Error('Received non-JSON Jira Server Response')
    }
    const json = await response.json()

    if (response.status !== 201 && response.status !== 200) {
      return new Error(
        `Fetching projects failed with status ${response.status}, ${this.formatError(json)}`
      )
    }

    return json
  }

  async requestRaw(method: string, path: string, body?: any) {
    const url = new URL(path, this.serverBaseUrl)
    const request = {
      url: url.toString(),
      method
    }
    const auth = this.oauth.authorize(request, this.token)
    return fetch(request.url, {
      method: request.method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...this.oauth.toHeader(auth)
      }
    })
  }

  async request<T>(method: string, path: string, body?: any) {
    const response = await this.requestRaw(method, path, body)
    return this.parseJsonResponse<T>(response)
  }

  async getCreateMeta() {
    return this.request<JiraServerCreateMeta>('GET', '/rest/api/2/issue/createmeta')
  }

  async getIssue(issueId: string) {
    return this.request<JiraServerIssue>(
      'GET',
      `/rest/api/latest/issue/${issueId}?expand=renderedFields`
    )
  }

  async createIssue(projectId: string, summary: string, description: string) {
    const meta = await this.getCreateMeta()
    if (meta instanceof Error) {
      return meta
    }
    const project = meta.projects.find((project) => project.id === projectId)

    if (!project) {
      return new Error('Project not found')
    }

    const {issuetypes} = project
    const bestIssueType = issuetypes.find((type) => type.name === 'Task') || issuetypes[0]

    if (!bestIssueType) {
      return new Error('No issue types specified')
    }

    return this.request<JiraServerCreateIssueResponse>('POST', '/rest/api/2/issue', {
      fields: {
        project: {
          id: projectId
        },
        issuetype: {
          id: bestIssueType.id
        },
        summary,
        description
      }
    })
  }

  async addComment(comment: string, issueId: string) {
    return this.request<JiraServerAddCommentResponse>(
      'POST',
      `/rest/api/2/issue/${issueId}/comment`,
      {
        body: comment
      }
    )
  }

  async getProjects() {
    return this.request<JiraServerRestProject[]>('GET', '/rest/api/latest/project')
  }

  async getProjectAvatar(avatarUrl: string) {
    const imageRes = await this.requestRaw('GET', avatarUrl)

    if (!imageRes || imageRes instanceof Error) return ''
    const arrayBuffer = await imageRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer).toString('base64')
    const contentType = imageRes.headers.get('content-type')
    return `data:${contentType};base64,${buffer}`
  }

  async createTask({
    rawContentStr,
    integrationRepoId
  }: {
    rawContentStr: string
    integrationRepoId: string
  }): Promise<CreateTaskResponse> {
    const {title: summary, contentState} = splitDraftContent(rawContentStr)
    // TODO: implement stateToJiraServerFormat
    const description = contentState.getPlainText()

    const {repositoryId} = IntegrationRepoId.split(integrationRepoId)

    const res = await this.createIssue(repositoryId, summary, description)

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
        providerId: this.provider.id,
        issueId,
        repositoryId
      }
    }
  }

  private makeCreateJiraServerTaskComment(
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
  ): Promise<string | Error> {
    const comment = this.makeCreateJiraServerTaskComment(
      viewerName,
      assigneeName,
      teamName,
      teamDashboardUrl
    )
    const res = await this.addComment(comment, issueId)
    if (res instanceof Error) {
      return res
    }
    return res.id
  }
}
