import {URL} from 'url'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  type OAuth2AuthorizationParams,
  type OAuth2AuthorizeResponse,
  type OAuth2RefreshAuthorizationParams
} from '../OAuth2Manager'

export default class LinearManager extends OAuth2Manager {
  private apiServerBaseUrl: string

  constructor(clientId: string, clientSecret: string, serverBaseUrl: string) {
    super(clientId, clientSecret, serverBaseUrl)

    const url = new URL(serverBaseUrl)
    const apiHostname = `api.${url.hostname}`
    this.apiServerBaseUrl = `${url.protocol}//${apiHostname}`
  }

  async authorize(code: string, redirectUri: string): Promise<Error | OAuth2AuthorizeResponse> {
    return this.fetchToken<OAuth2AuthorizeResponse>({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  }

  async refresh(refreshToken: string): Promise<Error | OAuth2AuthorizeResponse> {
    return this.fetchToken<OAuth2AuthorizeResponse>({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }

  protected async fetchToken<TSuccess>(
    partialAuthParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
  ): Promise<TSuccess | Error> {
    // Linear has some peculiarities: the server hostname changes from
    // linear.app -> api.linear.app between code and token retrieval.
    // Linear now provides refresh tokens with short-lived access tokens (~24 hours).
    const authUrlObj = new URL('/oauth/token', this.apiServerBaseUrl)
    const body = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      ...partialAuthParams
    }
    return authorizeOAuth2<TSuccess>({
      authUrl: authUrlObj.toString(),
      body,
      contentType: 'application/x-www-form-urlencoded'
    })
  }
}
