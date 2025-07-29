import type {TIntegrationProvider} from '../../../postgres/queries/getIntegrationProvidersByIds'
import type {IntegrationProviderWebhookResolvers} from '../resolverTypes'
import IntegrationProvider from './IntegrationProvider'

export type IntegrationProviderWebhookSource = TIntegrationProvider

const IntegrationProviderWebhook: IntegrationProviderWebhookResolvers = {
  ...IntegrationProvider,
  __isTypeOf: ({authStrategy}) => authStrategy === 'webhook'
}

export default IntegrationProviderWebhook
