import {URL} from 'url'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  OAuth2AuthorizationParams,
  OAuth2AuthorizeResponse,
  OAuth2RefreshAuthorizationParams
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

  async refresh(_refreshToken: string): Promise<Error | OAuth2AuthorizeResponse> {
    throw new Error('Linear does not support refresh tokens')
  }

  protected async fetchToken<TSuccess>(
    partialAuthParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
  ): Promise<TSuccess | Error> {
    // Linear has some peculiarities: the server hostname changes from
    // linear.app -> api.linear.app between code and token retrieval,
    // also, it does not provide a refresh token, but its access token
    // lives for 10 years!
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
