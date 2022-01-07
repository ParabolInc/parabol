import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import IntegrationProviderAuthStrategyEnum from './IntegrationProviderAuthStrategyEnum'
import IntegrationProviderScopeEnum from './IntegrationProviderScopeEnum'
import IntegrationProviderServiceEnum from './IntegrationProviderServiceEnum'

export const integrationProviderFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: "The provider's unique identifier",
    resolve: ({id}) => IntegrationProviderId.join(id)
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The team that the token is linked to'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: 'The timestamp the provider was created'
  },
  updatedAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: 'The timestamp the token was updated at'
  },
  service: {
    description: 'The service this provider is associated with',
    type: new GraphQLNonNull(IntegrationProviderServiceEnum)
  },
  authStrategy: {
    description: 'The kind of token used by this provider',
    type: new GraphQLNonNull(IntegrationProviderAuthStrategyEnum)
  },
  scope: {
    description:
      'The scope this provider configuration was created at (globally, org-wide, or by the team)',
    type: new GraphQLNonNull(IntegrationProviderScopeEnum)
  },
  isActive: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'true if the provider configuration should be used'
  }
})

const IntegrationProvider = new GraphQLInterfaceType({
  name: 'IntegrationProvider',
  description: 'An authentication provider configuration',
  fields: integrationProviderFields
})

export default IntegrationProvider
