import {
  IntegrationProvider,
  IntegrationProviderTypesEnum
} from '../postgres/types/IntegrationProvider'
import GitLabServerManager from './gitlab/GitLabServerManager'
import {AuthorizationManager, IntegrationServerManager} from './IntegrationServerManager'
import {GitLabAuthorizationManager} from './gitlab/GitLabAuthorizationManager'
import MattermostServerManager from '../utils/MattermostServerManager'

/**
 * Represents all the integration providers that require authorization.
 */
type AuthRequiredIntegrationProviderTypes = Exclude<IntegrationProviderTypesEnum, 'mattermost'>
export const allAuthRequiredIntegrationProviderTypes: IntegrationProviderTypesEnum[] = ['gitlab']

const authorizationManagerLookup: {
  [K in AuthRequiredIntegrationProviderTypes]: new (...args: any[]) => AuthorizationManager
} = {
  gitlab: GitLabAuthorizationManager
}

export const createAuthorizationManager = async <T extends AuthorizationManager>(
  provider: IntegrationProvider
) => {
  return new authorizationManagerLookup[provider.type](provider) as T
}

//TODO: Fix any after aligning mattermost the the proper interface
const integrationProviderClassMap: {
  [K in IntegrationProviderTypesEnum]: new (...args: any[]) => IntegrationServerManager | any
} = {
  gitlab: GitLabServerManager,
  mattermost: MattermostServerManager
}

export const createIntegrationServerManager = async <T extends IntegrationServerManager>(
  provider: IntegrationProvider,
  accessToken: string
) => {
  return new integrationProviderClassMap[provider.type](provider, accessToken) as T
}
