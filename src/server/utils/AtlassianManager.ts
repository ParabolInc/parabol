import fetch from 'node-fetch'
import AtlassianClientManager from 'universal/utils/AtlassianClientManager'
import {ATLASSIAN_SCOPE} from 'universal/utils/constants'
import makeAppLink from './makeAppLink'

interface AuthQueryParams {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
}

interface RefreshQueryParams {
  grant_type: 'refresh_token'
  refresh_token: string
}

interface OAuth2Response {
  access_token: string
  refresh_token: string
  error: any
  scope: string
}

class AtlassianManager extends AtlassianClientManager {
  static async init (code: string) {
    return AtlassianManager.fetchToken({
      grant_type: 'authorization_code',
      code,
      redirect_uri: makeAppLink('auth/atlassian')
    })
  }

  static async refresh (refreshToken: string) {
    return AtlassianManager.fetchToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }

  static async fetchToken (partialQueryParams: AuthQueryParams | RefreshQueryParams) {
    const queryParams = {
      ...partialQueryParams,
      client_id: process.env.ATLASSIAN_CLIENT_ID,
      client_secret: process.env.ATLASSIAN_CLIENT_SECRET
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

    const tokenJson = (await tokenRes.json()) as OAuth2Response

    const {access_token: accessToken, refresh_token: refreshToken, error, scope} = tokenJson
    if (error) {
      throw new Error(`Atlassian: ${error}`)
    }
    const providedScope = scope.split(' ')
    const matchingScope =
      new Set([...ATLASSIAN_SCOPE.split(' '), ...providedScope]).size === providedScope.length
    if (!matchingScope) {
      throw new Error(`bad scope: ${scope}`)
    }
    return new AtlassianManager(accessToken, refreshToken)
  }

  constructor (accessToken: string, refreshToken?: string) {
    super(accessToken, {fetch, refreshToken})
  }
}

export default AtlassianManager
