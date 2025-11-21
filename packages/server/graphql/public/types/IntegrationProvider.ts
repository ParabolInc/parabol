import IntegrationProviderId from '../../../../client/shared/gqlIds/IntegrationProviderId'
import type {IntegrationProviderResolvers} from '../resolverTypes'

const IntegrationProvider: IntegrationProviderResolvers = {
  id: ({id}) => IntegrationProviderId.join(id)
}

export default IntegrationProvider
