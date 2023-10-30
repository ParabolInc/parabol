import {GraphQLEnumType} from 'graphql'

const values = {
  PARABOL: {},
  github: {},
  jira: {},
  gitlab: {},
  mattermost: {},
  jiraServer: {},
  gcal: {},
  azureDevOps: {}
} as const

const ServiceEnum = new GraphQLEnumType({
  name: 'ServiceEnum',
  description: 'The list of services',
  values
})

export type ServiceEnumType = keyof typeof values

export default ServiceEnum
