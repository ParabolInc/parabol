import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLURLType from './GraphQLURLType'
import IntegrationProvider, {integrationProviderFields} from './IntegrationProvider'

const IntegrationProviderOAuth2 = new GraphQLObjectType<any, GQLContext>({
  name: 'IntegrationProviderOAuth2',
  description: 'An integration provider that connects via OAuth2',
  interfaces: () => [IntegrationProvider],
  isTypeOf: ({authStrategy}) => authStrategy === 'oauth2',
  fields: () => ({
    ...integrationProviderFields(),
    serverBaseUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The base URL of the OAuth2 server'
    },
    clientId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The OAuth2 client id'
    },
    tenantId: {
      type: GraphQLID,
      description: 'The tenant ID for Azure Active Directory Auth'
    }
  })
})

export default IntegrationProviderOAuth2
