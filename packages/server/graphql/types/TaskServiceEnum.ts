import {GraphQLEnumType} from 'graphql'

const values = {
  github: {},
  jira: {},
  jiraServer: {},
  gitlab: {},
  PARABOL: {}
} as const

const TaskServiceEnum = new GraphQLEnumType({
  name: 'TaskServiceEnum',
  description: 'The list of services for task integrations',
  values
})

export type TaskServiceEnumType = keyof typeof values

export default TaskServiceEnum
