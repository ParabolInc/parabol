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

  async request(method: string, path: string) {
    const url = new URL(path, this.serverBaseUrl)
    const request = {
      url: url.toString(),
      method
    }
    const auth = this.oauth.authorize(request, this.token)
    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        ...this.oauth.toHeader(auth)
      }
    })
    return response
  }

  async parseJsonResponse(response: Response) {
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return new Error('Received non-JSON Jira Server Response')
    }
    const json = await response.json()
    if (response.status !== 200) {
      return new Error(
        `Fetching projects failed with status ${response.status}, ${this.readError(json)}`
      )
    }

    return json
  }

  async getProjects(): Promise<JiraServerRestProject[] | Error> {
    const response = await this.request('GET', '/rest/api/latest/project')
    const projects = this.parseJsonResponse(response)
    return projects
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
