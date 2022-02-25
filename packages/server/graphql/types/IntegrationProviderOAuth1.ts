import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLURLType from './GraphQLURLType'
import IntegrationProvider, {integrationProviderFields} from './IntegrationProvider'

const IntegrationProviderOAuth1 = new GraphQLObjectType<any, GQLContext>({
  name: 'IntegrationProviderOAuth1',
  description: 'An integration provider that connects via OAuth1.0',
  interfaces: () => [IntegrationProvider],
  isTypeOf: ({authStrategy}) => authStrategy === 'oauth1',
  fields: () => ({
    ...integrationProviderFields(),
    serverBaseUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The base URL of the OAuth1 server'
    }
  })
})

export default IntegrationProviderOAuth1
