import {
  OAuth2AuthorizationManager,
  OAuth2Response,
  OAuthAuthorizationParams,
  OAuthRefreshAuthorizationParams
} from '../IntegrationServerManager'
import {
  IntegrationProvider,
  isOAuth2ProviderMetadata
} from '../../postgres/types/IntegrationProvider'
import {OAuth2IntegrationTokenMetadata} from '../../postgres/types/IntegrationToken'
import {stringify} from 'querystring'

export class GitLabAuthorizationManager implements OAuth2AuthorizationManager {
  provider: IntegrationProvider

  constructor(provider: IntegrationProvider) {
    this.provider = provider
  }

  async authorize(code: string, redirectUri: string) {
    return this.fetchToken({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  }

  async refresh(refreshToken: string) {
    return this.fetchToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }

  private async fetchToken(
    partialAuthParams: OAuthAuthorizationParams | OAuthRefreshAuthorizationParams
  ): Promise<OAuth2IntegrationTokenMetadata | Error> {
    const {providerMetadata} = this.provider
    if (!isOAuth2ProviderMetadata(providerMetadata)) {
      throw Error('Cannot authorize GitLab with non OAuth2 metadata!')
    }
    const {clientId, clientSecret, serverBaseUrl} = providerMetadata
    const queryParams = {
      client_id: clientId,
      client_secret: clientSecret,
      ...partialAuthParams
    }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const uri = `${serverBaseUrl}/oauth/token?${stringify(queryParams)}`
    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers
    })
    const tokenJson = (await tokenRes.json()) as Required<OAuth2Response>
    if ('error' in tokenJson) return new Error(tokenJson.error)
    const {access_token: accessToken, refresh_token: oauthRefreshToken, scope} = tokenJson
    return {
      accessToken,
      refreshToken: oauthRefreshToken,
      scopes: scope.split(',')
    }
  }
}
