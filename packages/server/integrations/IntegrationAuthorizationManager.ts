import {OAuth2IntegrationTokenMetadata} from '../postgres/types/IntegrationToken'
import {
  IntegrationProvider,
  IntegrationProviderTypesEnum
} from '../postgres/types/IntegrationProvider'
import {GitLabAuthorizationManager} from './gitlab/GitLabAuthorizationManager'

export interface OAuth2AuthorizationParams {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
}

export interface OAuth2RefreshAuthorizationParams {
  grant_type: 'refresh_token'
  refresh_token: string
}

export interface OAuth2IntegrationAuthorizationManager {
  provider: IntegrationProvider
  authorize(code: string, redirectUri: string): Promise<OAuth2IntegrationTokenMetadata | Error>
  refresh(refreshToken: string): Promise<OAuth2IntegrationTokenMetadata | Error>
}

export const isOAuth2AuthorizationManager = (
  authorizationManager: IntegrationAuthorizationManager
): authorizationManager is OAuth2IntegrationAuthorizationManager =>
  authorizationManager.provider.tokenType === 'oauth2'

export type IntegrationAuthorizationManager = OAuth2IntegrationAuthorizationManager

/**
 * Represents all the integration providers that require authorization.
 */
type AuthRequiredIntegrationProviderTypes = Exclude<IntegrationProviderTypesEnum, 'mattermost'>
export const allAuthRequiredIntegrationProviderTypes: IntegrationProviderTypesEnum[] = ['gitlab']

const authorizationManagerLookup: {
  [K in AuthRequiredIntegrationProviderTypes]: new (
    ...args: any[]
  ) => IntegrationAuthorizationManager
} = {
  gitlab: GitLabAuthorizationManager
}

export const createAuthorizationManager = async <T extends IntegrationAuthorizationManager>(
  provider: IntegrationProvider
) => {
  return new authorizationManagerLookup[provider.type](provider) as T
}
