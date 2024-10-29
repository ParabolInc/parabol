import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLURLType from './GraphQLURLType'
import IntegrationProvider, {integrationProviderFields} from './IntegrationProvider'

const IntegrationProviderSharedSecret = new GraphQLObjectType<any, GQLContext>({
  name: 'IntegrationProviderSharedSecret',
  description: 'An integration provider that connects via a shared secret',
  interfaces: () => [IntegrationProvider],
  isTypeOf: ({authStrategy}) => authStrategy === 'sharedSecret',
  fields: () => ({
    ...integrationProviderFields(),
    serverBaseUrl: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'The base URL of the OAuth1 server'
    },
    sharedSecret: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The shared secret used to sign requests'
    }
  })
})

export default IntegrationProviderSharedSecret
