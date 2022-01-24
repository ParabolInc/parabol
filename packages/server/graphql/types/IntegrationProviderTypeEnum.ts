import {GraphQLEnumType} from 'graphql'

const IntegrationProviderTypeEnum = new GraphQLEnumType({
  name: 'IntegrationProviderTypeEnum',
  description: 'Integration provider type',
  values: {
    jira: {},
    github: {}
  }
})

export type IntegrationProviderTypeEnumType = 'jira' | 'github'

export default IntegrationProviderTypeEnum
