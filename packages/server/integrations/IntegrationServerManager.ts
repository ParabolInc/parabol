import {GraphQLResolveInfo} from 'graphql'
import fetch from 'node-fetch'
import {stringify} from 'querystring'
import {IntegrationProvider, IntegrationToken} from '../postgres/types/IIntegrationProviderAndToken'

interface OAuth2ServerResponse {
  access_token: string
  created_at?: string
  error?: any
  refresh_token?: string
  scope: string
}

export interface SetupOAuth2ProviderParams {
  code: string
  redirectUri: string
}

interface IntegrationTokenState
  extends Pick<IntegrationToken, 'accessToken' | 'oauthRefreshToken' | 'oauthScopes'> {
  createdAt?: IntegrationToken['createdAt'] | null
}

abstract class IntegrationServerManager {
  provider: IntegrationProvider
  token: IntegrationTokenState | null

  constructor(provider: IntegrationProvider) {
    this.provider = provider
    this.token = null
  }

  /**
   * Retrieve an access token from an oauth2 given a code and redirect_uri
   * @param params
   * @returns access token materials
   */
  async setupOauth2Provider(params: SetupOAuth2ProviderParams) {
    const {code, redirectUri} = params
    const queryParams = {
      client_id: this.provider.oauthClientId,
      client_secret: this.provider.oauthClientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const uri = `${this.provider.serverBaseUri}/oauth/token?${stringify(queryParams)}`

    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers
    })
    const tokenJson = (await tokenRes.json()) as OAuth2ServerResponse
    const {
      access_token: accessToken,
      created_at: maybeCreatedAt,
      refresh_token: oauthRefreshToken,
      error,
      scope
    } = tokenJson
    if (error) {
      return new Error(`setupOauth2Provider: ${error}`)
    }

    this.token = {
      accessToken,
      createdAt: maybeCreatedAt ? new Date(maybeCreatedAt) : null,
      oauthRefreshToken: oauthRefreshToken || null,
      oauthScopes: scope.split(',')
    }

    return this.token
  }

  /**
   * Generic method to test if token is valid
   * @param info GraphQL resolver info
   * @param context GraphQL resolver context
   * @returns promise of boolean result and Error, if error occured
   */
  abstract isTokenValid(
    info: GraphQLResolveInfo,
    context: Record<any, any>
  ): Promise<[boolean, Error | null]>
}

abstract class TaskIntegrationServerManager extends IntegrationServerManager {}

/*
export abstract class NotificationIntegrationServerManager extends IntegrationServerManager {
  // FUTURE: perhaps for things like Slack, Mattermost, Teams & the like
}
*/

export {TaskIntegrationServerManager}
export default IntegrationServerManager
