import type {IntegrationProviderOAuth2Resolvers} from '../resolverTypes'
import IntegrationProvider from './IntegrationProvider'

const IntegrationProviderOAuth2: IntegrationProviderOAuth2Resolvers = {
  ...IntegrationProvider,
  __isTypeOf: ({authStrategy}) => authStrategy === 'oauth2'
}

export default IntegrationProviderOAuth2
