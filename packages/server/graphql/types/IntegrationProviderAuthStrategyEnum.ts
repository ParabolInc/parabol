import {GraphQLEnumType} from 'graphql'

const IntegrationProviderAuthStrategyEnum = new GraphQLEnumType({
  name: 'IntegrationProviderAuthStrategyEnum',
  description: 'The kind of token provided by the service',
  values: {
    oauth1: {},
    oauth2: {},
    pat: {},
    webhook: {},
    sharedSecret: {}
  }
})

export default IntegrationProviderAuthStrategyEnum
