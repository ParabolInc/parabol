import {GraphQLEnumType} from 'graphql'
import {GITHUB} from 'universal/utils/constants'

const TaskServiceEnum = new GraphQLEnumType({
  name: 'TaskServiceEnum',
  description: 'The list of services for task integrations',
  values: {
    [GITHUB]: {},
    jira: {}
  }
})

export default TaskServiceEnum
