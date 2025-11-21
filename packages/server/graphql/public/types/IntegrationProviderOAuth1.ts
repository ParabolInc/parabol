import type {IntegrationProviderOAuth1Resolvers} from '../resolverTypes'
import IntegrationProvider from './IntegrationProvider'

const IntegrationProviderOAuth1: IntegrationProviderOAuth1Resolvers = {
  ...IntegrationProvider,
  __isTypeOf: ({authStrategy}) => authStrategy === 'oauth1'
}

export default IntegrationProviderOAuth1
