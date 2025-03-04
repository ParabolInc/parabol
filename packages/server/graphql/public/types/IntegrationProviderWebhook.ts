import {TIntegrationProvider} from '../../../postgres/queries/getIntegrationProvidersByIds'
import {IntegrationProviderWebhookResolvers} from '../resolverTypes'
import IntegrationProvider from './IntegrationProvider'

export type IntegrationProviderWebhookSource = TIntegrationProvider

const IntegrationProviderWebhook: IntegrationProviderWebhookResolvers = {
  ...IntegrationProvider,
  __isTypeOf: ({authStrategy}) => authStrategy === 'webhook'
}

export default IntegrationProviderWebhook
