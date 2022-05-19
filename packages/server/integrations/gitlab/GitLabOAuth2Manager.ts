import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  OAuth2AuthorizationParams,
  OAuth2RefreshAuthorizationParams
} from '../OAuth2Manager'

export default class GitLabOAuth2Manager extends OAuth2Manager {
  async authorize(code: string, redirectUri: string) {
    return this.fetchToken<{
      accessToken: string
      refreshToken: string
      scopes: string
      expires_in: number
    }>({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  }

  async refresh(refreshToken: string) {
    return this.fetchToken<{accessToken: string; scopes: string}>({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }
  protected async fetchToken<TSuccess>(
    partialAuthParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
  ) {
    const authUrl = `${this.serverBaseUrl}/oauth/token`
    const searchParams = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      ...partialAuthParams
    }
    return authorizeOAuth2<TSuccess>({authUrl, searchParams})
  }
}
