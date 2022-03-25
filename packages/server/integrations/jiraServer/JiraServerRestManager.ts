import OAuth from 'oauth-1.0a'
import crypto from 'crypto'

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

interface JiraServerIssuesResponse {
  issues: JiraServerIssue[]
}

export default class JiraServerRestManager {
  serverBaseUrl: string
  oauth: OAuth
  token: OAuth.Token

  constructor(
    serverBaseUrl: string,
    consumerKey: string,
    consumerSecret: string,
    oauthToken: string,
    oauthTokenSecret: string
  ) {
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
      key: oauthToken,
      secret: oauthTokenSecret
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

  async getIssues() {
    // TODO: support JQL
    const jql = 'order by lastViewed DESC'
    const payload = {
      jql,
      maxResults: 100,
      expand: ['renderedFields']
    }

    return this.request<JiraServerIssuesResponse>('POST', '/rest/api/latest/search', payload)
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
}
