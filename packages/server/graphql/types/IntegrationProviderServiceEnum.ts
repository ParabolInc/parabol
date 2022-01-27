import {GraphQLEnumType} from 'graphql'

const IntegrationProviderServiceEnum = new GraphQLEnumType({
  name: 'IntegrationProviderServiceEnum',
  description: 'The name of the service of the Integration Provider',
  values: {
    jira: {},
    github: {},
    gitlab: {},
    mattermost: {}
  }
})

export type IntegrationProviderServiceEnumType = 'jira' | 'github' | 'gitlab' | 'mattermost'

export default IntegrationProviderServiceEnum
