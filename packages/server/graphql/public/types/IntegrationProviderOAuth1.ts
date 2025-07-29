import type {TIntegrationProvider} from '../../../postgres/queries/getIntegrationProvidersByIds'
import type {IntegrationProviderOAuth1Resolvers} from '../resolverTypes'
import IntegrationProvider from './IntegrationProvider'

export type IntegrationProviderOAuth1Source = TIntegrationProvider

const IntegrationProviderOAuth1: IntegrationProviderOAuth1Resolvers = {
  ...IntegrationProvider,
  __isTypeOf: ({authStrategy}) => authStrategy === 'oauth1'
}

export default IntegrationProviderOAuth1
