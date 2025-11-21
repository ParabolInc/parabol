import type {IntegrationProviderWebhookResolvers} from '../resolverTypes'
import IntegrationProvider from './IntegrationProvider'

const IntegrationProviderWebhook: IntegrationProviderWebhookResolvers = {
  ...IntegrationProvider,
  __isTypeOf: ({authStrategy}) => authStrategy === 'webhook'
}

export default IntegrationProviderWebhook
