import fetch from 'node-fetch'
import AtlassianManager from 'parabol-client/utils/AtlassianManager'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {authorizeOAuth2} from '../integrations/helpers/authorizeOAuth2'
import appOrigin from '../appOrigin'

interface AuthQueryParams {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
}

interface RefreshQueryParams {
  grant_type: 'refresh_token'
  refresh_token: string
}

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
    const body = {
      ...partialQueryParams,
      client_id: process.env.ATLASSIAN_CLIENT_ID!,
      client_secret: process.env.ATLASSIAN_CLIENT_SECRET!
    }

    const authUrl = `https://auth.atlassian.com/oauth/token`
    return authorizeOAuth2({authUrl, body})
  }

  constructor(accessToken: string) {
    super(accessToken)
  }
}

export default AtlassianServerManager
