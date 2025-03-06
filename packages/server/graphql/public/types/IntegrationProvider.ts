import IntegrationProviderId from '../../../../client/shared/gqlIds/IntegrationProviderId'
import {TIntegrationProvider} from '../../../postgres/queries/getIntegrationProvidersByIds'
import {IntegrationProviderResolvers} from '../resolverTypes'

export type IntegrationProviderSource = TIntegrationProvider

const IntegrationProvider: IntegrationProviderResolvers = {
  id: ({id}) => IntegrationProviderId.join(id)
}

export default IntegrationProvider
