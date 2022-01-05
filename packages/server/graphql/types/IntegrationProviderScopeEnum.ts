import {GraphQLEnumType} from 'graphql'

const IntegrationProviderScopeEnum = new GraphQLEnumType({
  name: 'IntegrationProviderScopeEnum',
  description: 'The scope this provider was created on (globally, org-wide, or on the team)',
  values: {
    global: {},
    org: {},
    team: {}
  }
})

export default IntegrationProviderScopeEnum
