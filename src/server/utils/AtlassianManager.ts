import makeAppLink from './makeAppLink'
import {ATLASSIAN_SCOPE} from 'universal/utils/constants'
import fetch from 'node-fetch'

interface JiraUser {
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

interface AccessibleResource {
  id: string
  name: string
  scopes: string[]
  avatarUrl: string
}

class AtlassianManager {
  static async init (code: string) {
    const queryParams = {
      grant_type: 'authorization_code',
      client_id: process.env.ATLASSIAN_CLIENT_ID,
      client_secret: process.env.ATLASSIAN_CLIENT_SECRET,
      code,
      redirect_uri: makeAppLink('auth/atlassian')
    }

    const uri = `https://auth.atlassian.com/oauth/token`

    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryParams)
    })

    const tokenJson = await tokenRes.json()

    const {access_token: accessToken, error, scope} = tokenJson
    if (error) {
      throw new Error(`GitHub: ${error}`)
    }
    const providedScope = scope.split(' ')
    const matchingScope =
      new Set([...ATLASSIAN_SCOPE.split(' '), ...providedScope]).size === providedScope.length
    if (!matchingScope) {
      throw new Error(`bad scope: ${scope}`)
    }
    return new AtlassianManager(accessToken)
  }

  accessToken: string
  options: {headers: {Authorization: string; Accept: 'application/json'}}

  constructor (accessToken: string) {
    this.accessToken = accessToken
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json' as 'application/json'
    }
    this.options = {headers}
  }

  async getAccessibleResources () {
    const siteRes = await fetch(
      'https://api.atlassian.com/oauth/token/accessible-resources',
      this.options
    )
    const siteJson = await siteRes.json()
    return siteJson as AccessibleResource[]
  }

  async getMyself (cloudId: string) {
    const selfRes = await fetch(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
      this.options
    )
    const selfJson = await selfRes.json()
    return selfJson as JiraUser
  }
}

export default AtlassianManager
