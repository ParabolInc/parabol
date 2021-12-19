import {
  OAuth2AuthorizationManager,
  OAuthAuthorizationParams,
  OAuthRefreshAuthorizationParams
} from '../IntegrationServerManager'
import {
  IntegrationProvider,
  isOAuth2ProviderMetadata
} from '../../postgres/types/IntegrationProvider'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'

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
  ) {
    const {providerMetadata} = this.provider
    if (!isOAuth2ProviderMetadata(providerMetadata)) {
      throw Error('Cannot authorize GitLab with non OAuth2 metadata!')
    }
    const {clientId, clientSecret, serverBaseUrl} = providerMetadata
    const authUrl = `${serverBaseUrl}/oauth/token`
    const queryParams = {
      client_id: clientId,
      client_secret: clientSecret,
      ...partialAuthParams
    }

    return authorizeOAuth2({authUrl, queryParams})
  }
}
