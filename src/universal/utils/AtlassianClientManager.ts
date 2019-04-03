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

export interface AtlassianError {
  code: number
  message: string
}

interface Options {
  fetch?: Window['fetch']
  refreshToken?: string
}

class AtlassianClientManager {
  accessToken: string
  refreshToken?: string
  fetch: (url) => any

  constructor (accessToken: string, options: Options = {}) {
    this.accessToken = accessToken
    this.refreshToken = options.refreshToken
    const fetch = options.fetch || window.fetch
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json' as 'application/json'
    }
    this.fetch = async (url) => {
      const res = await fetch(url, {headers})
      return res.json()
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
}

export default AtlassianClientManager
