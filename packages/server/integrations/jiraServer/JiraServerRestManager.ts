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

  readError(json: any) {
    if (json.id === 'https://docs.atlassian.com/jira/REST/schema/error-collection#') {
      return JSON.stringify(json.properties, undefined, '  ')
    }
    return ''
  }

  async parseJsonResponse(response: Response) {
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return new Error('Received non-JSON Jira Server Response')
    }
    const json = await response.json()

    if (response.status !== 201 && response.status !== 200) {
      console.error(`Jira server error ${response.status}`, json)
      return new Error(
        `Jira Server request failed with status ${response.status}, ${this.readError(json)}`
      )
    }

    return json
  }

  async request(method: string, path: string, body?: any) {
    const url = new URL(path, this.serverBaseUrl)
    const request = {
      url: url.toString(),
      method
    }
    const auth = this.oauth.authorize(request, this.token)
    const response = await fetch(request.url, {
      method: request.method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...this.oauth.toHeader(auth)
      }
    })

    return this.parseJsonResponse(response)
  }

  async getCreateMeta(): Promise<JiraServerCreateMeta | Error> {
    return this.request('GET', '/rest/api/2/issue/createmeta')
  }

  async getIssue(issueId: string): Promise<JiraServerIssue | Error> {
    return this.request('GET', `/rest/api/latest/issue/${issueId}?expand=renderedFields`)
  }

  async getIssues(): Promise<JiraServerIssue[] | Error> {
    // TODO: support JQL
    const jql = 'order by lastViewed DESC'
    const payload = {
      jql,
      maxResults: 100,
      expand: ['renderedFields']
    }

    return this.request('POST', '/rest/api/latest/search', payload)
  }

  async createIssue(
    projectId: string,
    summary: string,
    description: string
  ): Promise<JiraServerCreateIssueResponse | Error> {
    const meta = await this.getCreateMeta()
    if (meta instanceof Error) {
      throw meta
    }
    const project = meta.projects.find((project) => project.id === projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    const {issuetypes} = project
    const bestIssueType = issuetypes.find((type) => type.name === 'Task') || issuetypes[0]

    if (!bestIssueType) {
      throw new Error('No issue types specified')
    }

    return this.request('POST', '/rest/api/2/issue', {
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

  async addComment(
    comment: string,
    issueId: string
  ): Promise<JiraServerAddCommentResponse | Error> {
    return this.request('POST', `/rest/api/2/issue/${issueId}/comment`, {
      body: comment
    })
  }

  async getProjects(): Promise<JiraServerRestProject[] | Error> {
    return this.request('GET', '/rest/api/latest/project')
  }

  async getProjectAvatar(avatarUrl: string) {
    const imageRes = await this.request('GET', avatarUrl)

    if (!imageRes || imageRes instanceof Error) return ''
    const arrayBuffer = await imageRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer).toString('base64')
    const contentType = imageRes.headers.get('content-type')
    return `data:${contentType};base64,${buffer}`
  }
}
