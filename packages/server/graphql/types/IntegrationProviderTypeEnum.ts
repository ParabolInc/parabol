import {GraphQLEnumType} from 'graphql'

const IntegrationProviderTypeEnum = new GraphQLEnumType({
  name: 'IntegrationProviderTypeEnum',
  description: 'The kind of token provided by the service',
  values: {
    oauth2: {},
    pat: {},
    webhook: {}
  }
})

export default IntegrationProviderTypeEnum
