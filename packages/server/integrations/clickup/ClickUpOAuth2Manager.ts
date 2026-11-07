import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../appOrigin'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  type OAuth2AuthorizationParams,
  type OAuth2RefreshAuthorizationParams,
  type OAuth2RefreshResponse,
  type OAuth2TokenResponse
} from '../OAuth2Manager'

const TOKEN_URL = 'https://api.clickup.com/api/v2/oauth/token'

export default class ClickUpOAuth2Manager extends OAuth2Manager {
  static readonly REDIRECT_URI = makeAppURL(appOrigin, 'auth/clickup')

  async authorize(code: string) {
    const auth = await this.fetchToken<OAuth2TokenResponse>({
      grant_type: 'authorization_code',
      code,
      redirect_uri: ClickUpOAuth2Manager.REDIRECT_URI
    })
    if (auth instanceof Error) return auth
    return {...auth, providerUserId: null}
  }

  async refresh(refreshToken: string) {
    return this.fetchToken<OAuth2RefreshResponse>({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }

  protected async fetchToken<TSuccess>(
    partialAuthParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
  ) {
    return authorizeOAuth2<TSuccess>({
      authUrl: TOKEN_URL,
      body: {client_id: this.clientId, client_secret: this.clientSecret, ...partialAuthParams},
      contentType: 'application/x-www-form-urlencoded'
    })
  }
}
