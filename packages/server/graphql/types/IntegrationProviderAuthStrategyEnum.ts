import {GraphQLEnumType} from 'graphql'

const IntegrationProviderAuthStrategyEnum = new GraphQLEnumType({
  name: 'IntegrationProviderAuthStrategyEnum',
  description: 'The kind of token provided by the service',
  values: {
    oauth2: {},
    pat: {},
    webhook: {}
  }
})

export default IntegrationProviderAuthStrategyEnum
