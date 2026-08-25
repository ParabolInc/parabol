import {fetch} from '@whatwg-node/fetch'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  type OAuth2AuthorizationParams,
  type OAuth2AuthorizeResponse,
  type OAuth2RefreshAuthorizationParams
} from '../OAuth2Manager'

export default class GitHubOAuth2Manager extends OAuth2Manager {
  async authorize(code: string) {
    const auth = await this.fetchToken({grant_type: 'authorization_code', code, redirect_uri: ''})
    if (auth instanceof Error) return auth
    const res = await fetch(`${this.serverBaseUrl}/user`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'User-Agent': 'Parabol',
        Accept: 'application/vnd.github+json'
      }
    })
    if (!res.ok) return new Error(`GitHub: could not read the authorized user (${res.status})`)
    const {login} = (await res.json()) as {login?: string}
    if (!login) return new Error('GitHub: user has no login')
    return {...auth, providerUserId: login}
  }

  async refresh(_refreshToken: string) {
    return new Error('GitHub OAuth tokens do not expire')
  }

  protected async fetchToken(
    partialAuthParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
  ) {
    if (partialAuthParams.grant_type !== 'authorization_code') {
      return new Error('GitHub OAuth tokens do not expire')
    }
    return authorizeOAuth2<OAuth2AuthorizeResponse>({
      authUrl: 'https://github.com/login/oauth/access_token',
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: partialAuthParams.code
      }
    })
  }
}
