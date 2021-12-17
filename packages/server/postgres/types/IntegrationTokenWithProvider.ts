import {IGetIntegrationTokensWithProviderQueryResult} from '../queries/generated/getIntegrationTokensWithProviderQuery'
import {IntegrationToken} from './IntegrationToken'
import {IntegrationProvider} from './IntegrationProvider'

export interface IntegrationTokenWithProvider extends IntegrationToken {
  provider: IntegrationProvider
}

/**
 * @param flatIntegrationTokenWithProvider raw flattened integration token with provider fromn database
 * @returns {IntegrationTokenWithProvider}
 */
export const nestIntegrationProviderOnIntegrationToken = (
  flatIntegrationTokenWithProvider: IGetIntegrationTokensWithProviderQueryResult
) => {
  return Object.keys(flatIntegrationTokenWithProvider).reduce(
    (obj, key) => {
      if (key.startsWith('IntegrationProvider_')) {
        return {
          ...obj,
          provider: {
            ...obj.provider,
            [key.replace('IntegrationProvider_', '')]: flatIntegrationTokenWithProvider[key]
          }
        }
      }
      return {...obj, [key]: flatIntegrationTokenWithProvider[key]}
    },
    {provider: {}}
  ) as IntegrationTokenWithProvider
}
