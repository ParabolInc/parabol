import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  type OAuth2AuthorizationParams,
  type OAuth2RefreshAuthorizationParams,
  type OAuth2TokenResponse
} from '../OAuth2Manager'
import clickUpRequest from './clickUpRequest'

const TOKEN_URL = 'https://api.clickup.com/api/v2/oauth/token'

export default class ClickUpOAuth2Manager extends OAuth2Manager {
  async authorize(code: string) {
    const auth = await this.fetchToken({grant_type: 'authorization_code', code, redirect_uri: ''})
    if (auth instanceof Error) return auth
    const {accessToken} = auth
    const res = await clickUpRequest<{user?: {id?: number}}>({accessToken}, '/user')
    if (res instanceof Error) return res
    const providerUserId = res.user?.id
    if (providerUserId === undefined) {
      return new Error('ClickUp: could not read the authorized user')
    }
    return {
      accessToken,
      refreshToken: undefined,
      scopes: '',
      providerUserId: String(providerUserId)
    }
  }

  async refresh(_refreshToken: string) {
    return new Error('ClickUp tokens do not expire')
  }

  protected async fetchToken(
    partialAuthParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
  ) {
    if (partialAuthParams.grant_type !== 'authorization_code') {
      return new Error('ClickUp tokens do not expire')
    }
    return authorizeOAuth2<OAuth2TokenResponse>({
      authUrl: TOKEN_URL,
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: partialAuthParams.code
      },
      contentType: 'application/json'
    })
  }
}
