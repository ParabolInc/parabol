import crypto from 'crypto'
import OAuth from 'oauth-1.0a'
import IntegrationRepoId from '~/shared/gqlIds/IntegrationRepoId'
import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import {ExternalLinks} from '~/types/constEnums'
import composeJQL from '~/utils/composeJQL'
import splitDraftContent from '~/utils/draftjs/splitDraftContent'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {IntegrationProviderJiraServer} from '../../postgres/queries/getIntegrationProvidersByIds'
import {CreateTaskResponse, TaskIntegrationManager} from '../TaskIntegrationManagerFactory'

const MAX_PAGINATION_RESULTS = 5000
const MAX_RESULTS_PER_PAGE = 50

export type JiraServerRestProject = {
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
    issuetype: {
      id: string
      name: string
      iconUrl: string
    }
    summary: string
    description: string | null
    project: {
      id: string
      key: string
      name: string
    }
  }
  renderedFields: {
    description: string
  }
}

type JiraServerIssueType = {
  id: string
  name: string
  description: string
  iconUrl: string
  subtask: boolean
}

export type JiraServerFieldType = {
  fieldId: string
  name: string
  operations: ('add' | 'set' | 'remove')[]
  allowedValues: string[]
  schema: {
    type: 'number' | 'string' | string
  }
}

type Paginated<T> = {
  total: number
  isLast: boolean
  maxResults: number
  values: T[]
}

interface JiraServerIssuesResponse {
  issues: JiraServerIssue[]
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
      return new Error(this.formatError(json))
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
    const headers = this.oauth.toHeader(auth)

    return fetch(request.url, {
      method: request.method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })
  }

  async request<T>(method: string, path: string, body?: any) {
    const response = await this.requestRaw(method, path, body)
    return this.parseJsonResponse<T>(response)
  }

  async requestAll<T>(method: string, path: string, body?: any): Promise<T[] | Error> {
    const result = [] as T[]
    let response: Paginated<T> | Error

    const separator = path.includes('?') ? '&' : '?'
    for (let startAt = 0; startAt < MAX_PAGINATION_RESULTS; startAt += MAX_RESULTS_PER_PAGE) {
      response = await this.request<Paginated<T>>(
        method,
        `${path}${separator}startAt=${startAt}&maxResults=${MAX_RESULTS_PER_PAGE}`,
        body
      )
      if (response instanceof Error) {
        return response
      }
      result.push(...response.values)
      if (response.isLast) {
        break
      }
    }
    return result
  }

  async getIssue(issueId: string) {
    return this.request<JiraServerIssue>(
      'GET',
      `/rest/api/2/issue/${issueId}?expand=renderedFields`
    )
  }

  async getIssues(
    queryString: string | null,
    isJQL: boolean,
    projectKeys: string[],
    maxResults = 25,
    startAt = 0
  ) {
    if (queryString && queryString.length === 1) {
      return new Error('Search term is too short, please enter at least 2 characters')
    }

    const jql = composeJQL(queryString, isJQL, projectKeys)

    const payload = {
      jql,
      maxResults,
      startAt,
      expand: ['renderedFields']
    }

    return this.request<JiraServerIssuesResponse>('POST', '/rest/api/2/search', payload)
  }

  async createIssue(projectId: string, summary: string, description: string) {
    const issueTypes = await this.getIssueTypes(projectId)
    if (issueTypes instanceof Error) {
      return issueTypes
    }

    const bestIssueType = issueTypes.find((type) => type.name === 'Task') || issueTypes[0]

    if (!bestIssueType) {
      return new Error('No issue types specified')
    }

    const createdIssue = await this.request<JiraServerCreateIssueResponse>(
      'POST',
      '/rest/api/2/issue',
      {
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
      }
    )
    if (createdIssue instanceof Error) {
      return createdIssue
    }
    return {
      ...createdIssue,
      issueType: bestIssueType
    }
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
    return this.request<JiraServerRestProject[]>('GET', '/rest/api/2/project')
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

    const createdIssue = await this.createIssue(repositoryId, summary, description)

    if (createdIssue instanceof Error) {
      return createdIssue
    }
    const {id: issueId} = createdIssue
    const issueRes = await this.getIssue(issueId)
    if (issueRes instanceof Error) {
      return issueRes
    }
    const projectName = issueRes.fields.project.name
    const projectKey = issueRes.fields.project.key
    return {
      integrationHash: JiraServerIssueId.join(this.provider.id, repositoryId, issueId),
      issueId,
      integration: {
        accessUserId: this.auth.userId,
        service: 'jiraServer',
        providerId: this.provider.id,
        issueId,
        repositoryId,
        name: projectName,
        key: projectKey
      }
    }
  }

  private makeCreateTaskComment(
    creator: string,
    assignee: string,
    teamName: string,
    teamDashboardUrl: string
  ) {
    return `Created by ${creator} for ${assignee}
    See the dashboard of [${teamName}|${teamDashboardUrl}]

    _Powered by [Parabol|${ExternalLinks.INTEGRATIONS_JIRASERVER}]_`
  }

  private makeScoreComment(
    dimensionName: string,
    finalScore: string,
    meetingName: string,
    discussionURL: string
  ) {
    return `*${dimensionName}: ${finalScore}*
    [See the discussion|${discussionURL}] in ${meetingName}

    _Powered by [Parabol|${ExternalLinks.GETTING_STARTED_SPRINT_POKER}]_`
  }

  async addCreatedBySomeoneElseComment(
    viewerName: string,
    assigneeName: string,
    teamName: string,
    teamDashboardUrl: string,
    issueId: string
  ): Promise<string | Error> {
    const comment = this.makeCreateTaskComment(viewerName, assigneeName, teamName, teamDashboardUrl)
    const res = await this.addComment(comment, issueId)
    if (res instanceof Error) {
      return res
    }
    return res.id
  }

  async addScoreComment(
    dimensionName: string,
    finalScore: string,
    meetingName: string,
    discussionURL: string,
    remoteIssueId: string
  ) {
    const comment = this.makeScoreComment(dimensionName, finalScore, meetingName, discussionURL)
    const res = await this.addComment(comment, remoteIssueId)
    if (res instanceof Error) {
      return res
    }
    return res.id
  }

  async getIssueTypes(projectIdOrKey: string) {
    const path = `/rest/api/2/issue/createmeta/${projectIdOrKey}/issuetypes`
    const types = await this.requestAll<JiraServerIssueType>('GET', path)
    return types
  }

  async getFieldTypes(projectIdOrKey: string, issueType: string) {
    const path = `/rest/api/2/issue/createmeta/${projectIdOrKey}/issuetypes/${issueType}`
    const types = await this.requestAll<JiraServerFieldType>('GET', path)
    return types
  }

  async setField(issueId: string, fieldId: string, value: any) {
    const url = `/rest/api/2/issue/${issueId}`
    const update = {
      fields: {
        [fieldId]: value
      }
    }
    const response = await this.requestRaw('PUT', url, update)
    if (![200, 201, 204].includes(response.status)) {
      return new Error(`Updating issue field failed with status ${response.status}`)
    }
    return undefined
  }
}
