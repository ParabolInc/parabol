import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../appOrigin'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import fetchGoogleUserId from '../helpers/fetchGoogleUserId'
import OAuth2Manager, {
  type OAuth2AuthorizationParams,
  type OAuth2RefreshAuthorizationParams
} from '../OAuth2Manager'

export default class GmeetOAuth2Manager extends OAuth2Manager {
  static readonly REDIRECT_URI = makeAppURL(appOrigin, 'auth/gmeet')

  async authorize(code: string) {
    const auth = await this.fetchToken<{
      accessToken: string
      refreshToken: string
      scopes: string
      expiresIn: number
    }>({
      grant_type: 'authorization_code',
      code,
      redirect_uri: GmeetOAuth2Manager.REDIRECT_URI
    })
    if (auth instanceof Error) return auth
    const providerUserId = await fetchGoogleUserId(auth.accessToken)
    return {...auth, providerUserId: providerUserId instanceof Error ? null : providerUserId}
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
    const authUrl = 'https://oauth2.googleapis.com/token'
    const searchParams = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      ...partialAuthParams
    }
    return authorizeOAuth2<TSuccess>({authUrl, searchParams})
  }
}
