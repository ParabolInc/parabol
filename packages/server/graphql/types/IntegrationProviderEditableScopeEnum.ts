import {GraphQLEnumType} from 'graphql'

export type TIntegrationProviderEditableScopeEnum = 'org' | 'team'

const IntegrationProviderEditableScopeEnum = new GraphQLEnumType({
  name: 'IntegrationProviderEditableScopeEnum',
  description: 'The scope this provider was created on by a user (excluding global scope)',
  values: {
    org: {},
    team: {}
  }
})

export default IntegrationProviderEditableScopeEnum
