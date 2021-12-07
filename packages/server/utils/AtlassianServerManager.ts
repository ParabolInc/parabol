import fetch from 'node-fetch'
import AtlassianManager from 'parabol-client/utils/AtlassianManager'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import {OAuth2Error, OAuth2Success} from '../types/custom'

interface AuthQueryParams {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
}

interface RefreshQueryParams {
  grant_type: 'refresh_token'
  refresh_token: string
}

interface AtlassianOAuth2Success extends OAuth2Success {
  refresh_token: string
  scope: string
}

type OAuth2Response = AtlassianOAuth2Success | OAuth2Error

class AtlassianServerManager extends AtlassianManager {
  fetch = fetch as any
  static async init(code: string) {
    return AtlassianServerManager.fetchToken({
      grant_type: 'authorization_code',
      code,
      redirect_uri: makeAppURL(appOrigin, 'auth/atlassian')
    })
  }

  static async refresh(refreshToken: string) {
    return AtlassianServerManager.fetchToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }

  private static async fetchToken(partialQueryParams: AuthQueryParams | RefreshQueryParams) {
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
    if ('error' in tokenJson) return new Error(tokenJson.error)
    const {access_token: accessToken, refresh_token: refreshToken, scope} = tokenJson
    return {accessToken, refreshToken, scope}
  }

  constructor(accessToken: string) {
    super(accessToken)
  }
}

export default AtlassianServerManager
