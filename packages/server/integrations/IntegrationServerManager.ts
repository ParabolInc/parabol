import {GraphQLResolveInfo} from 'graphql'
import {IntegrationProvider, IntegrationProvidersEnum} from '../postgres/types/IntegrationProvider'
import GitLabServerManager from './gitlab/GitLabServerManager'
import MattermostServerManager from '../utils/MattermostServerManager'

//TODO: Fix any after aligning mattermost the the proper interface
const integrationProviderClassMap: {
  [K in IntegrationProvidersEnum]: new (...args: any[]) => IntegrationServerManager | any
} = {
  gitlab: GitLabServerManager,
  mattermost: MattermostServerManager
}

export const createIntegrationServerManager = async <T extends IntegrationServerManager>(
  integrationProvider: IntegrationProvider,
  accessToken: string
) => {
  return new integrationProviderClassMap[integrationProvider.provider](
    integrationProvider,
    accessToken
  ) as T
}

export interface WebHookIntegrationServerManager {
  provider: IntegrationProvider
}

export const isWebHookIntegrationServerManager = (
  integrationServerManager: IntegrationServerManager
): integrationServerManager is WebHookIntegrationServerManager =>
  integrationServerManager.provider.type === 'webhook'

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
  integrationServerManager.provider.type === 'oauth2'

/**
 * Union type reperesenting all integration server managers
 */
export type IntegrationServerManager =
  | WebHookIntegrationServerManager
  | OAuth2IntegrationServerManager
