export interface JiraUser {
  self: string
  key: string
  accountId: string
  name: string
  emailAddress: string
  avatarUrls: {[key: string]: string}
  displayName: string
  active: boolean
  timeZone: string
}

export interface AccessibleResource {
  id: string
  name: string
  scopes: string[]
  avatarUrl: string
}

export interface JiraProject {
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
  projectCategory: {
    self: string
    id: string
    name: string
    description: string
  }
  simplified: boolean
  style: string
}

export interface JiraProjectResponse {
  self: string
  nextPage: string
  maxResults: number
  startAt: number
  total: number
  isLast: boolean
  values: JiraProject[]
}

export interface AtlassianError {
  code: number
  message: string
}

interface AtlassianClientManagerOptions {
  fetch?: Window['fetch']
  refreshToken?: string
}

interface GetProjectsResult {
  cloudId: string
  newProjects: JiraProject[]
}

type GetProjectsCallback = (error: AtlassianError | null, result: GetProjectsResult | null) => void

class AtlassianClientManager {
  accessToken: string
  refreshToken?: string
  fetch: (url) => any
  // the any is for node until we can use tsc in nodeland
  cache: {[key: string]: {result: any; expiration: number | any}} = {}
  timeout = 5000
  constructor (accessToken: string, options: AtlassianClientManagerOptions = {}) {
    this.accessToken = accessToken
    this.refreshToken = options.refreshToken
    const fetch = options.fetch || window.fetch
    const headers = {
      // an Authorization requires a preflight request, ie reqs are slow
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json' as 'application/json'
    }
    this.fetch = async (url) => {
      const record = this.cache[url]
      if (!record) {
        const res = await fetch(url, {headers})
        const result = await res.json()
        this.cache[url] = {
          result,
          expiration: setTimeout(() => {
            delete this.cache[url]
          }, this.timeout)
        }
      } else {
        clearTimeout(record.expiration)
        record.expiration = setTimeout(() => {
          delete this.cache[url]
        }, this.timeout)
      }
      return this.cache[url].result
    }
  }

  async getAccessibleResources () {
    return this.fetch('https://api.atlassian.com/oauth/token/accessible-resources') as
      | AccessibleResource[]
      | AtlassianError
  }

  async getMyself (cloudId: string) {
    return this.fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`) as
      | JiraUser
      | AtlassianError
  }

  async getPaginatedProjects (cloudId: string, url: string, callback: GetProjectsCallback) {
    const res = (await this.fetch(url)) as JiraProjectResponse | AtlassianError
    if ('message' in res) {
      callback(res, null)
    } else {
      callback(null, {cloudId, newProjects: res.values})
      if (res.nextPage) {
        await this.getPaginatedProjects(cloudId, res.nextPage, callback).catch(console.error)
      }
    }
  }

  async getProjects (cloudIds: string[], callback: GetProjectsCallback) {
    return Promise.all(
      cloudIds.map(async (cloudId) => {
        return this.getPaginatedProjects(
          cloudId,
          `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search?orderBy=name`,
          callback
        ).catch(console.error)
      })
    )
  }

  async getProject (cloudId: string, projectId: string) {
    return this.fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectId}`
    ) as JiraProject | AtlassianError
  }
}

export default AtlassianClientManager
