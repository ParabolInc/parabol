import {fetch} from '@whatwg-node/fetch'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {URL} from 'url'
import appOrigin from '../../appOrigin'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  type OAuth2AuthorizationParams,
  type OAuth2AuthorizeResponse,
  type OAuth2RefreshAuthorizationParams,
  type OAuth2RefreshResponse,
  type OAuth2TokenResponse
} from '../OAuth2Manager'

export default class LinearManager extends OAuth2Manager {
  static readonly REDIRECT_URI = makeAppURL(appOrigin, 'auth/linear')
  private apiServerBaseUrl: string

  constructor(clientId: string, clientSecret: string, serverBaseUrl: string) {
    super(clientId, clientSecret, serverBaseUrl)

    const url = new URL(serverBaseUrl)
    const apiHostname = `api.${url.hostname}`
    this.apiServerBaseUrl = `${url.protocol}//${apiHostname}`
  }

  async authorize(code: string): Promise<Error | OAuth2AuthorizeResponse> {
    const auth = await this.fetchToken<OAuth2TokenResponse>({
      grant_type: 'authorization_code',
      code,
      redirect_uri: LinearManager.REDIRECT_URI
    })
    if (auth instanceof Error) return auth
    const res = await fetch(`${this.apiServerBaseUrl}/graphql`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({query: '{ viewer { id } }'})
    })
    if (!res.ok) return new Error(`Linear: could not read the authorized user (${res.status})`)
    const {data} = (await res.json()) as {data?: {viewer?: {id?: string}}}
    const providerUserId = data?.viewer?.id
    if (!providerUserId) return new Error('Linear: user has no id')
    return {...auth, providerUserId}
  }

  async refresh(refreshToken: string): Promise<Error | OAuth2RefreshResponse> {
    const res = await this.fetchToken<OAuth2TokenResponse>({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
    if (res instanceof Error) return res
    return {...res, expiresIn: res.expiresIn ?? 86400}
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
