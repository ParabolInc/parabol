import {GraphQLEnumType} from 'graphql'

const TaskServiceEnum = new GraphQLEnumType({
  name: 'TaskServiceEnum',
  description: 'The list of services for task integrations',
  values: {
    github: {},
    jira: {},
    PARABOL: {},
    jiraServer: {}
  }
})

export type TaskServiceEnumType = 'github' | 'jira' | 'PARABOL' | 'jiraServer'

export default TaskServiceEnum
