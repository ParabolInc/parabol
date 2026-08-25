import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../appOrigin'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  type OAuth2AuthorizationParams,
  type OAuth2RefreshAuthorizationParams
} from '../OAuth2Manager'

export default class GitLabOAuth2Manager extends OAuth2Manager {
  static readonly REDIRECT_URI = makeAppURL(appOrigin, 'auth/gitlab')

  async authorize(code: string) {
    return this.fetchToken<{
      accessToken: string
      refreshToken: string
      scopes: string
      expiresIn: number
    }>({
      grant_type: 'authorization_code',
      code,
      redirect_uri: GitLabOAuth2Manager.REDIRECT_URI
    })
  }

  async refresh(refreshToken: string) {
    return this.fetchToken<{
      accessToken: string
      scopes: string
      refreshToken: string
      expiresIn: number
    }>({
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
