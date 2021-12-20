import {GraphQLResolveInfo} from 'graphql'
import {IntegrationProvider} from '../postgres/types/IntegrationProvider'
import {OAuth2Error, OAuth2Success} from '../types/custom'
import {OAuth2IntegrationTokenMetadata} from '../postgres/types/IntegrationToken'

export type OAuth2GrantType = 'authorization_code' | 'refresh_token'

export interface OAuthAuthorizationParams {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
}

export interface OAuthRefreshAuthorizationParams {
  grant_type: 'refresh_token'
  refresh_token: string
}

export type OAuth2Response = OAuth2Success | OAuth2Error

export interface OAuth2AuthorizationManager {
  provider: IntegrationProvider
  authorize(code: string, redirectUri: string): Promise<OAuth2IntegrationTokenMetadata | Error>
  refresh(refreshToken: string): Promise<OAuth2IntegrationTokenMetadata | Error>
}

export const isOAuth2AuthorizationManager = (
  authorizationManager: AuthorizationManager
): authorizationManager is OAuth2AuthorizationManager =>
  authorizationManager.provider.tokenType === 'oauth2'

export type AuthorizationManager = OAuth2AuthorizationManager

export interface WebHookIntegrationServerManager {
  provider: IntegrationProvider
}

export const isWebHookIntegrationServerManager = (
  integrationServerManager: IntegrationServerManager
): integrationServerManager is WebHookIntegrationServerManager =>
  integrationServerManager.provider.tokenType === 'webhook'

export interface OAuth2IntegrationServerManager {
  provider: IntegrationProvider
  accessToken: string

  /**
   * Generic method to test if token is valid
   * @param info GraphQL resolver info
   * @param context GraphQL resolver context
   * @returns promise of boolean result and Error, if error occured
   */
  isTokenValid(
    info: GraphQLResolveInfo,
    context: Record<any, any>
  ): Promise<[boolean, Error | null]>
}

export const isOAuth2IntegrationServerManager = (
  integrationServerManager: IntegrationServerManager
): integrationServerManager is OAuth2IntegrationServerManager =>
  integrationServerManager.provider.tokenType === 'oauth2'

export type IntegrationServerManager =
  | WebHookIntegrationServerManager
  | OAuth2IntegrationServerManager
