import IntegrationProviderId from '../../../../client/shared/gqlIds/IntegrationProviderId'
import type {TIntegrationProvider} from '../../../postgres/queries/getIntegrationProvidersByIds'
import type {IntegrationProviderResolvers} from '../resolverTypes'

export type IntegrationProviderSource = TIntegrationProvider

const IntegrationProvider: IntegrationProviderResolvers = {
  id: ({id}) => IntegrationProviderId.join(id)
}

export default IntegrationProvider
